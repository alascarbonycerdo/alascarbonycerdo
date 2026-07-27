import type { H3Event } from 'h3'
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type { Factura, ResumenCompraPeriodo } from '#shared/types/factura'

const FACTURA_SELECT = '*, punto:puntos_venta(nombre)'

function toFactura(row: {
  id: string
  fecha: string
  descripcion: string
  valor: number
  punto_venta_id: string | null
  created_at: string
  punto: { nombre: string } | null
}): Factura {
  return {
    id: row.id,
    fecha: row.fecha,
    descripcion: row.descripcion,
    valor: row.valor,
    puntoVentaId: row.punto_venta_id,
    puntoVentaNombre: row.punto?.nombre ?? null,
    createdAt: row.created_at,
  }
}

export async function listFacturas(event: H3Event): Promise<Factura[]> {
  const client = await serverSupabaseClient(event)
  const { data, error } = await client
    .from('facturas_compra')
    .select(FACTURA_SELECT)
    .order('fecha', { ascending: false })
    .order('created_at', { ascending: false })
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return (data ?? []).map(toFactura)
}

export async function createFactura(
  event: H3Event,
  payload: { fecha: string; descripcion: string; valor: number; puntoVentaId?: string | null },
): Promise<Factura> {
  if (!payload.fecha) {
    throw createError({ statusCode: 400, statusMessage: 'La fecha es obligatoria' })
  }
  if (!payload.descripcion?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'La descripción es obligatoria' })
  }
  if (!payload.valor || payload.valor <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'El valor debe ser mayor a 0' })
  }

  const client = await serverSupabaseClient(event)
  const user = await serverSupabaseUser(event)

  const { data, error } = await client
    .from('facturas_compra')
    .insert({
      fecha: payload.fecha,
      descripcion: payload.descripcion.trim(),
      valor: payload.valor,
      punto_venta_id: payload.puntoVentaId || null,
      creado_por: user?.sub,
    })
    .select(FACTURA_SELECT)
    .single()

  if (error || !data) {
    throw createError({ statusCode: 500, statusMessage: error?.message ?? 'No se pudo crear la factura' })
  }
  return toFactura(data)
}

export async function updateFactura(
  event: H3Event,
  id: string,
  patch: { fecha?: string; descripcion?: string; valor?: number; puntoVentaId?: string | null },
): Promise<Factura> {
  const update: { fecha?: string; descripcion?: string; valor?: number; punto_venta_id?: string | null } = {}
  if (patch.fecha !== undefined) update.fecha = patch.fecha
  if (patch.descripcion !== undefined) {
    if (!patch.descripcion.trim()) throw createError({ statusCode: 400, statusMessage: 'La descripción es obligatoria' })
    update.descripcion = patch.descripcion.trim()
  }
  if (patch.valor !== undefined) {
    if (patch.valor <= 0) throw createError({ statusCode: 400, statusMessage: 'El valor debe ser mayor a 0' })
    update.valor = patch.valor
  }
  if (patch.puntoVentaId !== undefined) update.punto_venta_id = patch.puntoVentaId || null

  const client = await serverSupabaseClient(event)
  const { data, error } = await client.from('facturas_compra').update(update).eq('id', id).select(FACTURA_SELECT).single()

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  if (!data) throw createError({ statusCode: 404, statusMessage: 'Factura no encontrada' })
  return toFactura(data)
}

export async function deleteFactura(event: H3Event, id: string): Promise<void> {
  const client = await serverSupabaseClient(event)
  const { error } = await client.from('facturas_compra').delete().eq('id', id)
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
}

// Lunes de la semana ISO a la que pertenece la fecha (cálculo puramente calendario,
// sin conversión de huso horario — igual que formatDia en shared/utils/horario.ts).
function isoWeekStart(fecha: string): string {
  const [year = 1970, month = 1, day = 1] = fecha.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  const weekday = date.getUTCDay()
  const diffToMonday = weekday === 0 ? -6 : 1 - weekday
  date.setUTCDate(date.getUTCDate() + diffToMonday)
  return date.toISOString().slice(0, 10)
}

function monthStart(fecha: string): string {
  return `${fecha.slice(0, 7)}-01`
}

export async function getResumenCompras(
  event: H3Event,
): Promise<{ semanal: ResumenCompraPeriodo[]; mensual: ResumenCompraPeriodo[] }> {
  const client = await serverSupabaseClient(event)
  const { data, error } = await client.from('facturas_compra').select('fecha, valor')
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  const semanalMap = new Map<string, number>()
  const mensualMap = new Map<string, number>()
  for (const row of data ?? []) {
    const semana = isoWeekStart(row.fecha)
    const mes = monthStart(row.fecha)
    semanalMap.set(semana, (semanalMap.get(semana) ?? 0) + row.valor)
    mensualMap.set(mes, (mensualMap.get(mes) ?? 0) + row.valor)
  }

  const semanal = Array.from(semanalMap.entries())
    .map(([periodo, total]) => ({ periodo, total }))
    .sort((a, b) => b.periodo.localeCompare(a.periodo))
    .slice(0, 8)

  const mensual = Array.from(mensualMap.entries())
    .map(([periodo, total]) => ({ periodo, total }))
    .sort((a, b) => b.periodo.localeCompare(a.periodo))
    .slice(0, 6)

  return { semanal, mensual }
}
