import type { H3Event } from 'h3'
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { porkItems, wingsCombos } from '#shared/utils/menu'
import type { DaySummary, InventoryDishUsage, InventoryItem, Movement, SaleRecord } from '#shared/types/dashboard'

const TIME_ZONE = 'America/Bogota'

const catalog = [...wingsCombos, ...porkItems]

function splitTimestamp(iso: string) {
  const instant = new Date(iso)
  const date = new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE }).format(instant)
  const time = new Intl.DateTimeFormat('es-CO', {
    timeZone: TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(instant)
  return { date, time }
}

function dayLabel(date: string) {
  const [year = 1970, month = 1, day = 1] = date.split('-').map(Number)
  const asUtc = new Date(Date.UTC(year, month - 1, day))
  const formatted = new Intl.DateTimeFormat('es-CO', {
    weekday: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(asUtc)
  return formatted.replace('.', '')
}

// Resuelve el punto de venta sobre el que operar: el propio del perfil del usuario,
// salvo que sea administrador y haya pedido explícitamente ver otro punto (override,
// usado por la pantalla de gestión de puntos de venta). Las rutas de escritura nunca
// pasan override, así que siempre quedan ancladas al punto propio del que vende.
async function resolvePuntoVentaId(event: H3Event, override?: string): Promise<string> {
  const client = await serverSupabaseClient(event)
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'No autenticado' })

  const { data: profile, error } = await client
    .from('profiles')
    .select('role, punto_venta_id')
    .eq('id', user.sub)
    .single()
  if (error || !profile) throw createError({ statusCode: 403, statusMessage: 'Perfil no encontrado' })

  if (override && profile.role === 'administrador') return override

  if (!profile.punto_venta_id) {
    throw createError({ statusCode: 400, statusMessage: 'Tu usuario no tiene un punto de venta asignado' })
  }
  return profile.punto_venta_id
}

function toInventoryItem(
  row: {
    id: string
    nombre: string
    detalle: string | null
    unidades_por_paquete: number
  },
  dishes: InventoryDishUsage[],
  currentStock: number,
): InventoryItem {
  return {
    id: row.id,
    name: row.nombre,
    detail: row.detalle ?? undefined,
    currentStock,
    unitsPerPackage: row.unidades_por_paquete,
    dishes,
  }
}

function toDishUsage(row: { dish_id: string; consumo_por_venta: number }): InventoryDishUsage {
  const dish = catalog.find((entry) => entry.id === row.dish_id)
  return {
    dishId: row.dish_id,
    dishName: dish?.name ?? row.dish_id,
    consumptionPerSale: row.consumo_por_venta,
  }
}

async function getItemDishes(event: H3Event, itemId: string): Promise<InventoryDishUsage[]> {
  const client = await serverSupabaseClient(event)
  const { data, error } = await client
    .from('dish_inventory_map')
    .select('dish_id, consumo_por_venta')
    .eq('inventario_item_id', itemId)
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return (data ?? []).map(toDishUsage)
}

async function getItemStock(event: H3Event, itemId: string, puntoVentaId: string): Promise<number> {
  const client = await serverSupabaseClient(event)
  const { data, error } = await client
    .from('inventario_stock')
    .select('stock_actual')
    .eq('item_id', itemId)
    .eq('punto_venta_id', puntoVentaId)
    .maybeSingle()
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return data?.stock_actual ?? 0
}

function toMovement(row: {
  id: string
  dish_id: string
  tipo: string
  cantidad: number
  nota: string | null
  created_at: string
}): Movement {
  const { date, time } = splitTimestamp(row.created_at)
  return {
    id: row.id,
    date,
    time,
    dishId: row.dish_id,
    type: row.tipo as Movement['type'],
    amount: row.cantidad,
    note: row.nota ?? undefined,
  }
}

function toSaleRecord(row: {
  id: string
  dish_id: string
  dish_nombre: string
  cantidad: number
  precio_unitario_miles: number
  total_miles: number
  created_at: string
  vendedor_nombre: string | null
}): SaleRecord {
  const { date, time } = splitTimestamp(row.created_at)
  return {
    id: row.id,
    date,
    time,
    dishId: row.dish_id,
    dishName: row.dish_nombre,
    qty: row.cantidad,
    unitPriceThousands: row.precio_unitario_miles,
    totalThousands: row.total_miles,
    vendedorNombre: row.vendedor_nombre ?? undefined,
  }
}

export async function getInventory(event: H3Event, override?: string): Promise<InventoryItem[]> {
  const client = await serverSupabaseClient(event)
  const puntoVentaId = await resolvePuntoVentaId(event, override)

  const [itemsRes, mapRes, stockRes] = await Promise.all([
    client.from('inventario_items').select('*').order('id'),
    client.from('dish_inventory_map').select('dish_id, inventario_item_id, consumo_por_venta'),
    client.from('inventario_stock').select('item_id, stock_actual').eq('punto_venta_id', puntoVentaId),
  ])
  if (itemsRes.error) throw createError({ statusCode: 500, statusMessage: itemsRes.error.message })
  if (mapRes.error) throw createError({ statusCode: 500, statusMessage: mapRes.error.message })
  if (stockRes.error) throw createError({ statusCode: 500, statusMessage: stockRes.error.message })

  const dishesByItem = new Map<string, InventoryDishUsage[]>()
  for (const row of mapRes.data ?? []) {
    const list = dishesByItem.get(row.inventario_item_id) ?? []
    list.push(toDishUsage(row))
    dishesByItem.set(row.inventario_item_id, list)
  }

  const stockByItem = new Map((stockRes.data ?? []).map((row) => [row.item_id, row.stock_actual]))

  return (itemsRes.data ?? []).map((row) =>
    toInventoryItem(row, dishesByItem.get(row.id) ?? [], stockByItem.get(row.id) ?? 0),
  )
}

export async function getMovements(event: H3Event, override?: string): Promise<Movement[]> {
  const client = await serverSupabaseClient(event)
  const puntoVentaId = await resolvePuntoVentaId(event, override)
  const { data, error } = await client
    .from('movimientos_inventario')
    .select('*')
    .eq('punto_venta_id', puntoVentaId)
    .order('created_at')
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return (data ?? []).map(toMovement)
}

export async function getSales(event: H3Event, override?: string): Promise<SaleRecord[]> {
  const client = await serverSupabaseClient(event)
  const puntoVentaId = await resolvePuntoVentaId(event, override)
  const { data, error } = await client
    .from('ventas')
    .select('*')
    .eq('punto_venta_id', puntoVentaId)
    .order('created_at')
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return (data ?? []).map(toSaleRecord)
}

export async function restock(event: H3Event, itemId: string, amount: number, note?: string): Promise<InventoryItem> {
  if (amount <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'La cantidad debe ser mayor a 0' })
  }

  const client = await serverSupabaseClient(event)
  const puntoVentaId = await resolvePuntoVentaId(event)

  // El ajuste de stock + el registro de auditoría se hacen en una sola transacción
  // atómica del lado de la base de datos (ver migración restock_item_rpc) — evita
  // depender de un trigger sobre movimientos_inventario que además ya dispara la
  // reversión de handle_venta_delete y duplicaría el ajuste.
  const { error: rpcError } = await client.rpc('restock_item', {
    p_item_id: itemId,
    p_cantidad: amount,
    p_nota: note ?? null,
  })

  if (rpcError) {
    const statusCode = rpcError.message.includes('No autorizado') ? 403 : 500
    throw createError({ statusCode, statusMessage: rpcError.message })
  }

  const { data, error } = await client.from('inventario_items').select('*').eq('id', itemId).single()
  if (error || !data) throw createError({ statusCode: 404, statusMessage: 'Insumo no encontrado' })
  const [dishes, stock] = await Promise.all([getItemDishes(event, itemId), getItemStock(event, itemId, puntoVentaId)])
  return toInventoryItem(data, dishes, stock)
}

export async function removeStock(event: H3Event, itemId: string, amount: number, note?: string): Promise<InventoryItem> {
  if (amount <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'La cantidad debe ser mayor a 0' })
  }

  const client = await serverSupabaseClient(event)
  const puntoVentaId = await resolvePuntoVentaId(event)

  // Solo el administrador puede descontar stock manualmente (mermas, correcciones);
  // el chequeo de rol vive en la función, igual que restock_item.
  const { error: rpcError } = await client.rpc('remove_stock_item', {
    p_item_id: itemId,
    p_cantidad: amount,
    p_nota: note ?? null,
  })

  if (rpcError) {
    const statusCode = rpcError.message.includes('No autorizado') ? 403 : 500
    throw createError({ statusCode, statusMessage: rpcError.message })
  }

  const { data, error } = await client.from('inventario_items').select('*').eq('id', itemId).single()
  if (error || !data) throw createError({ statusCode: 404, statusMessage: 'Insumo no encontrado' })
  const [dishes, stock] = await Promise.all([getItemDishes(event, itemId), getItemStock(event, itemId, puntoVentaId)])
  return toInventoryItem(data, dishes, stock)
}

export async function updateInventoryConfig(
  event: H3Event,
  itemId: string,
  patch: { unitsPerPackage?: number; dishId?: string; consumptionPerSale?: number },
): Promise<InventoryItem> {
  const client = await serverSupabaseClient(event)

  if (patch.unitsPerPackage !== undefined) {
    if (patch.unitsPerPackage < 1) {
      throw createError({ statusCode: 400, statusMessage: 'Las unidades por paquete deben ser al menos 1' })
    }
    const { data: updated, error } = await client
      .from('inventario_items')
      .update({ unidades_por_paquete: patch.unitsPerPackage })
      .eq('id', itemId)
      .select('id')
    if (error) throw createError({ statusCode: 500, statusMessage: error.message })
    // RLS deja pasar el UPDATE pero filtra la fila (0 rows) si el rol no es administrador,
    // en vez de devolver un error — hay que detectarlo a mano.
    if (!updated || updated.length === 0) {
      throw createError({ statusCode: 403, statusMessage: 'Solo un administrador puede editar el inventario' })
    }
  }

  if (patch.dishId !== undefined && patch.consumptionPerSale !== undefined) {
    if (patch.consumptionPerSale <= 0) {
      throw createError({ statusCode: 400, statusMessage: 'El consumo debe ser mayor a 0' })
    }
    const { data: updated, error } = await client
      .from('dish_inventory_map')
      .update({ consumo_por_venta: patch.consumptionPerSale })
      .eq('dish_id', patch.dishId)
      .eq('inventario_item_id', itemId)
      .select('dish_id')
    if (error) throw createError({ statusCode: 500, statusMessage: error.message })
    if (!updated || updated.length === 0) {
      throw createError({ statusCode: 403, statusMessage: 'Solo un administrador puede editar el inventario' })
    }
  }

  const { data, error } = await client.from('inventario_items').select('*').eq('id', itemId).single()
  if (error || !data) throw createError({ statusCode: 404, statusMessage: 'Insumo no encontrado' })
  const puntoVentaId = await resolvePuntoVentaId(event)
  const [dishes, stock] = await Promise.all([getItemDishes(event, itemId), getItemStock(event, itemId, puntoVentaId)])
  return toInventoryItem(data, dishes, stock)
}

export async function recordSale(event: H3Event, dishId: string, qty: number): Promise<{ sale: SaleRecord; inventory: InventoryItem }> {
  if (qty <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'La cantidad debe ser mayor a 0' })
  }

  const dish = catalog.find((entry) => entry.id === dishId)
  if (!dish) {
    throw createError({ statusCode: 404, statusMessage: 'Plato no encontrado' })
  }

  const client = await serverSupabaseClient(event)
  const user = await serverSupabaseUser(event)
  const puntoVentaId = await resolvePuntoVentaId(event)

  let vendedorNombre = user?.email ?? null
  if (user?.sub) {
    const { data: profile } = await client.from('profiles').select('nombre').eq('id', user.sub).single()
    if (profile?.nombre) vendedorNombre = profile.nombre
  }

  const { data: saleRow, error: insertError } = await client
    .from('ventas')
    .insert({
      dish_id: dishId,
      dish_nombre: dish.name,
      cantidad: qty,
      precio_unitario_miles: dish.priceThousands,
      total_miles: dish.priceThousands * qty,
      vendedor_id: user?.sub,
      vendedor_nombre: vendedorNombre,
      punto_venta_id: puntoVentaId,
    })
    .select()
    .single()

  if (insertError || !saleRow) {
    const statusCode = insertError?.code === '42501' ? 403 : 500
    throw createError({ statusCode, statusMessage: insertError?.message ?? 'No se pudo registrar la venta' })
  }

  const { data: mapRow, error: mapError } = await client
    .from('dish_inventory_map')
    .select('inventario_item_id')
    .eq('dish_id', dishId)
    .maybeSingle()
  if (mapError) throw createError({ statusCode: 500, statusMessage: mapError.message })
  if (!mapRow) throw createError({ statusCode: 404, statusMessage: 'Plato no tiene inventario asociado' })

  const { data: itemRow, error: itemError } = await client
    .from('inventario_items')
    .select('*')
    .eq('id', mapRow.inventario_item_id)
    .single()
  if (itemError || !itemRow) throw createError({ statusCode: 404, statusMessage: 'Plato no encontrado' })

  const [dishes, stock] = await Promise.all([
    getItemDishes(event, mapRow.inventario_item_id),
    getItemStock(event, mapRow.inventario_item_id, puntoVentaId),
  ])
  return { sale: toSaleRecord(saleRow), inventory: toInventoryItem(itemRow, dishes, stock) }
}

export async function deleteSale(event: H3Event, id: string): Promise<void> {
  const client = await serverSupabaseClient(event)
  const { error } = await client.from('ventas').delete().eq('id', id)
  if (error) {
    const statusCode = error.code === '42501' ? 403 : 500
    throw createError({ statusCode, statusMessage: error.message })
  }
}

function lastNDates(days: number): string[] {
  const dates: string[] = []
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date()
    d.setUTCDate(d.getUTCDate() - i)
    dates.push(new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE }).format(d))
  }
  return dates
}

export async function getWeeklySummary(event: H3Event, days = 7, override?: string): Promise<DaySummary[]> {
  const [sales, movements] = await Promise.all([getSales(event, override), getMovements(event, override)])
  const dates = lastNDates(days)

  return dates.map((date) => {
    const daySales = sales.filter((sale) => sale.date === date)
    const dayConsumption = movements
      .filter((movement) => movement.date === date && movement.type === 'sale')
      .reduce((sum, movement) => sum + movement.amount, 0)

    return {
      date,
      label: dayLabel(date),
      revenueThousands: daySales.reduce((sum, sale) => sum + sale.totalThousands, 0),
      itemsSold: daySales.reduce((sum, sale) => sum + sale.qty, 0),
      unitsConsumed: dayConsumption,
    }
  })
}
