import type { H3Event } from 'h3'
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { porkItems, wingsCombos } from '#shared/utils/menu'
import type { DaySummary, InventoryItem, Movement, SaleRecord } from '#shared/types/dashboard'

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

function toInventoryItem(row: {
  id: string
  nombre: string
  detalle: string | null
  consumo_por_venta: number
  stock_actual: number
}): InventoryItem {
  return {
    id: row.id,
    name: row.nombre,
    detail: row.detalle ?? undefined,
    consumptionPerSale: row.consumo_por_venta,
    currentStock: row.stock_actual,
  }
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
  }
}

export async function getInventory(event: H3Event): Promise<InventoryItem[]> {
  const client = await serverSupabaseClient(event)
  const { data, error } = await client.from('inventario_items').select('*').order('id')
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return (data ?? []).map(toInventoryItem)
}

export async function getMovements(event: H3Event): Promise<Movement[]> {
  const client = await serverSupabaseClient(event)
  const { data, error } = await client.from('movimientos_inventario').select('*').order('created_at')
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return (data ?? []).map(toMovement)
}

export async function getSales(event: H3Event): Promise<SaleRecord[]> {
  const client = await serverSupabaseClient(event)
  const { data, error } = await client.from('ventas').select('*').order('created_at')
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return (data ?? []).map(toSaleRecord)
}

export async function restock(event: H3Event, dishId: string, amount: number, note?: string): Promise<InventoryItem> {
  if (amount <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'La cantidad debe ser mayor a 0' })
  }

  const client = await serverSupabaseClient(event)
  const user = await serverSupabaseUser(event)

  const { error: insertError } = await client
    .from('movimientos_inventario')
    .insert({ dish_id: dishId, tipo: 'restock', cantidad: amount, nota: note, creado_por: user?.sub })

  if (insertError) {
    const statusCode = insertError.code === '42501' ? 403 : 500
    throw createError({ statusCode, statusMessage: insertError.message })
  }

  const { data, error } = await client.from('inventario_items').select('*').eq('id', dishId).single()
  if (error || !data) throw createError({ statusCode: 404, statusMessage: 'Plato no encontrado' })
  return toInventoryItem(data)
}

export async function updateConsumption(event: H3Event, dishId: string, consumptionPerSale: number): Promise<InventoryItem> {
  if (consumptionPerSale < 0) {
    throw createError({ statusCode: 400, statusMessage: 'El consumo no puede ser negativo' })
  }

  const client = await serverSupabaseClient(event)
  const { data, error } = await client
    .from('inventario_items')
    .update({ consumo_por_venta: consumptionPerSale })
    .eq('id', dishId)
    .select()
    .maybeSingle()

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  // RLS deja pasar el UPDATE pero filtra la fila (0 rows) si el rol no es administrador,
  // en vez de devolver un error — hay que detectarlo a mano.
  if (!data) throw createError({ statusCode: 403, statusMessage: 'Solo un administrador puede editar el inventario' })
  return toInventoryItem(data)
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

  const { data: saleRow, error: insertError } = await client
    .from('ventas')
    .insert({
      dish_id: dishId,
      dish_nombre: dish.name,
      cantidad: qty,
      precio_unitario_miles: dish.priceThousands,
      total_miles: dish.priceThousands * qty,
      vendedor_id: user?.sub,
    })
    .select()
    .single()

  if (insertError || !saleRow) {
    const statusCode = insertError?.code === '42501' ? 403 : 500
    throw createError({ statusCode, statusMessage: insertError?.message ?? 'No se pudo registrar la venta' })
  }

  const { data: itemRow, error: itemError } = await client
    .from('inventario_items')
    .select('*')
    .eq('id', dishId)
    .single()
  if (itemError || !itemRow) throw createError({ statusCode: 404, statusMessage: 'Plato no encontrado' })

  return { sale: toSaleRecord(saleRow), inventory: toInventoryItem(itemRow) }
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

export async function getWeeklySummary(event: H3Event, days = 7): Promise<DaySummary[]> {
  const [sales, movements] = await Promise.all([getSales(event), getMovements(event)])
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
      proteinConsumedGrams: dayConsumption,
    }
  })
}
