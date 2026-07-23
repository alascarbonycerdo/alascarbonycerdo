import type { H3Event } from 'h3'
import { serverSupabaseClient } from '#supabase/server'
import type { PuntoVentaSummary } from '#shared/types/puntoVenta'

const TIME_ZONE = 'America/Bogota'

function bogotaDayRangeUtc(dateStr: string) {
  const start = new Date(`${dateStr}T00:00:00-05:00`)
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000)
  return { start: start.toISOString(), end: end.toISOString() }
}

export async function listPuntosVenta(event: H3Event): Promise<PuntoVentaSummary[]> {
  const client = await serverSupabaseClient(event)

  const today = new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE }).format(new Date())
  const { start, end } = bogotaDayRangeUtc(today)

  const [puntosRes, profilesRes, salesRes, stockRes, mapRes] = await Promise.all([
    client.from('puntos_venta').select('*').order('created_at'),
    client.from('profiles').select('punto_venta_id').not('punto_venta_id', 'is', null),
    client.from('ventas').select('punto_venta_id, total_miles').gte('created_at', start).lt('created_at', end),
    client.from('inventario_stock').select('item_id, punto_venta_id, stock_actual'),
    client.from('dish_inventory_map').select('inventario_item_id, consumo_por_venta'),
  ])

  if (puntosRes.error) throw createError({ statusCode: 500, statusMessage: puntosRes.error.message })
  if (profilesRes.error) throw createError({ statusCode: 500, statusMessage: profilesRes.error.message })
  if (salesRes.error) throw createError({ statusCode: 500, statusMessage: salesRes.error.message })
  if (stockRes.error) throw createError({ statusCode: 500, statusMessage: stockRes.error.message })
  if (mapRes.error) throw createError({ statusCode: 500, statusMessage: mapRes.error.message })

  const vendorCounts = new Map<string, number>()
  for (const p of profilesRes.data ?? []) {
    if (!p.punto_venta_id) continue
    vendorCounts.set(p.punto_venta_id, (vendorCounts.get(p.punto_venta_id) ?? 0) + 1)
  }

  const revenueByPoint = new Map<string, number>()
  for (const sale of salesRes.data ?? []) {
    revenueByPoint.set(sale.punto_venta_id, (revenueByPoint.get(sale.punto_venta_id) ?? 0) + sale.total_miles)
  }

  // Umbral de "stock bajo" por insumo: la menor cantidad que consume cualquiera de
  // los platos que se sirven de él (mismo criterio que el panel de inventario).
  const minConsumptionByItem = new Map<string, number>()
  for (const row of mapRes.data ?? []) {
    const current = minConsumptionByItem.get(row.inventario_item_id)
    if (current === undefined || row.consumo_por_venta < current) {
      minConsumptionByItem.set(row.inventario_item_id, row.consumo_por_venta)
    }
  }

  const lowStockByPoint = new Map<string, number>()
  for (const row of stockRes.data ?? []) {
    const minConsumption = minConsumptionByItem.get(row.item_id)
    if (minConsumption === undefined) continue
    if (row.stock_actual < minConsumption) {
      lowStockByPoint.set(row.punto_venta_id, (lowStockByPoint.get(row.punto_venta_id) ?? 0) + 1)
    }
  }

  return (puntosRes.data ?? []).map((row) => ({
    id: row.id,
    nombre: row.nombre,
    direccion: row.direccion ?? undefined,
    activo: row.activo,
    createdAt: row.created_at,
    vendedoresCount: vendorCounts.get(row.id) ?? 0,
    todayRevenueThousands: revenueByPoint.get(row.id) ?? 0,
    lowStockCount: lowStockByPoint.get(row.id) ?? 0,
  }))
}

export async function createPuntoVenta(
  event: H3Event,
  payload: { nombre: string; direccion?: string },
): Promise<PuntoVentaSummary> {
  if (!payload.nombre.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'El nombre es obligatorio' })
  }

  const client = await serverSupabaseClient(event)

  const { data: punto, error } = await client
    .from('puntos_venta')
    .insert({ nombre: payload.nombre.trim(), direccion: payload.direccion?.trim() || null })
    .select()
    .single()
  if (error || !punto) {
    throw createError({ statusCode: 500, statusMessage: error?.message ?? 'No se pudo crear el punto de venta' })
  }

  // Siembra el inventario del punto nuevo en 0 para cada insumo del catálogo, así
  // aparece completo desde el día uno en vez de tener filas faltantes.
  const { data: items, error: itemsError } = await client.from('inventario_items').select('id')
  if (itemsError) throw createError({ statusCode: 500, statusMessage: itemsError.message })

  if (items && items.length) {
    const { error: seedError } = await client
      .from('inventario_stock')
      .insert(items.map((item) => ({ item_id: item.id, punto_venta_id: punto.id, stock_actual: 0 })))
    if (seedError) throw createError({ statusCode: 500, statusMessage: seedError.message })
  }

  return {
    id: punto.id,
    nombre: punto.nombre,
    direccion: punto.direccion ?? undefined,
    activo: punto.activo,
    createdAt: punto.created_at,
    vendedoresCount: 0,
    todayRevenueThousands: 0,
    lowStockCount: 0,
  }
}

export async function updatePuntoVenta(
  event: H3Event,
  id: string,
  patch: { nombre?: string; direccion?: string; activo?: boolean },
): Promise<void> {
  const update: { nombre?: string; direccion?: string | null; activo?: boolean } = {}
  if (patch.nombre !== undefined) {
    if (!patch.nombre.trim()) throw createError({ statusCode: 400, statusMessage: 'El nombre es obligatorio' })
    update.nombre = patch.nombre.trim()
  }
  if (patch.direccion !== undefined) update.direccion = patch.direccion.trim() || null
  if (patch.activo !== undefined) update.activo = patch.activo

  const client = await serverSupabaseClient(event)
  const { error } = await client.from('puntos_venta').update(update).eq('id', id)
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
}
