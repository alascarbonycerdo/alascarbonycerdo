import type { H3Event } from 'h3'
import { serverSupabaseClient } from '#supabase/server'
import { porkItems, wingsCombos } from '#shared/utils/menu'
import type { Pedido, PedidoItem } from '#shared/types/pedido'

const TIME_ZONE = 'America/Bogota'

const catalog = [...wingsCombos, ...porkItems]

const PEDIDO_SELECT = '*, punto:puntos_venta(nombre), pedido_items(*)'

function splitTimestamp(iso: string) {
  const instant = new Date(iso)
  return {
    date: new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE }).format(instant),
    time: new Intl.DateTimeFormat('es-CO', {
      timeZone: TIME_ZONE,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(instant),
  }
}

function toPedidoItem(row: {
  dish_id: string
  dish_nombre: string
  cantidad: number
  precio_unitario_miles: number
  subtotal_miles: number
}): PedidoItem {
  return {
    dishId: row.dish_id,
    dishNombre: row.dish_nombre,
    cantidad: row.cantidad,
    precioUnitarioMiles: row.precio_unitario_miles,
    subtotalMiles: row.subtotal_miles,
  }
}

function toPedido(row: {
  id: string
  responsable_id: string | null
  responsable_nombre: string | null
  punto_venta_id: string
  total_miles: number
  created_at: string
  punto: { nombre: string } | null
  pedido_items: Parameters<typeof toPedidoItem>[0][]
}): Pedido {
  const { date, time } = splitTimestamp(row.created_at)
  const items = (row.pedido_items ?? []).map(toPedidoItem)
  return {
    id: row.id,
    date,
    time,
    responsableId: row.responsable_id,
    responsableNombre: row.responsable_nombre,
    puntoVentaId: row.punto_venta_id,
    puntoVentaNombre: row.punto?.nombre ?? null,
    totalMiles: row.total_miles,
    itemsCount: items.reduce((sum, item) => sum + item.cantidad, 0),
    createdAt: row.created_at,
    items,
  }
}

export async function listPedidos(event: H3Event, override?: string): Promise<Pedido[]> {
  const client = await serverSupabaseClient(event)
  const puntoVentaId = await resolvePuntoVentaId(event, override)
  const { data, error } = await client
    .from('pedidos')
    .select(PEDIDO_SELECT)
    .eq('punto_venta_id', puntoVentaId)
    .order('created_at', { ascending: false })
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return (data ?? []).map(toPedido)
}

export async function createPedido(
  event: H3Event,
  items: { dishId: string; cantidad: number }[],
  fecha?: string,
): Promise<Pedido> {
  if (!items?.length) {
    throw createError({ statusCode: 400, statusMessage: 'El pedido debe tener al menos un plato' })
  }

  const resolved = items.map((entry) => {
    if (!entry.cantidad || entry.cantidad <= 0) {
      throw createError({ statusCode: 400, statusMessage: 'La cantidad debe ser mayor a 0' })
    }
    const dish = catalog.find((item) => item.id === entry.dishId)
    if (!dish) {
      throw createError({ statusCode: 404, statusMessage: 'Plato no encontrado' })
    }
    return {
      dish_id: dish.id,
      dish_nombre: dish.name,
      cantidad: entry.cantidad,
      precio_unitario_miles: dish.priceThousands,
    }
  })

  const client = await serverSupabaseClient(event)

  // Toda la escritura (cabecera + ítems + descuento de stock) ocurre dentro de la
  // función create_pedido, en una sola transacción: o entra el pedido completo o
  // no entra nada. La función valida rol, punto de venta y retrodatado.
  const { data: pedidoId, error: rpcError } = await client.rpc('create_pedido', {
    p_items: resolved,
    ...(fecha ? { p_fecha: fecha } : {}),
  })
  if (rpcError) {
    const statusCode = rpcError.message.includes('No autorizado') ? 403 : 400
    throw createError({ statusCode, statusMessage: rpcError.message })
  }

  const { data, error } = await client.from('pedidos').select(PEDIDO_SELECT).eq('id', pedidoId).single()
  if (error || !data) throw createError({ statusCode: 500, statusMessage: error?.message ?? 'No se pudo crear el pedido' })
  return toPedido(data)
}

export async function deletePedido(event: H3Event, id: string): Promise<void> {
  const client = await serverSupabaseClient(event)
  const { error } = await client.rpc('delete_pedido', { p_id: id })
  if (error) {
    const statusCode = error.message.includes('No autorizado') ? 403 : 500
    throw createError({ statusCode, statusMessage: error.message })
  }
}
