import type { H3Event } from 'h3'
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type { ResumenPagoEmpleado, Turno } from '#shared/types/horario'

const TURNO_SELECT = '*, empleado:profiles!turnos_empleado_id_fkey(nombre), punto:puntos_venta(nombre)'

function toTurno(row: {
  id: string
  dia: string
  hora_entrada_programada: string
  hora_salida_programada: string
  hora_entrada_real: string | null
  hora_salida_real: string | null
  estado: string
  created_at: string
  empleado_id: string
  punto_venta_id: string
  empleado: { nombre: string | null } | null
  punto: { nombre: string } | null
}): Turno {
  return {
    id: row.id,
    empleadoId: row.empleado_id,
    empleadoNombre: row.empleado?.nombre ?? 'Sin nombre',
    puntoVentaId: row.punto_venta_id,
    puntoVentaNombre: row.punto?.nombre ?? '—',
    dia: row.dia,
    horaEntradaProgramada: row.hora_entrada_programada,
    horaSalidaProgramada: row.hora_salida_programada,
    horaEntradaReal: row.hora_entrada_real,
    horaSalidaReal: row.hora_salida_real,
    estado: row.estado as Turno['estado'],
    createdAt: row.created_at,
  }
}

// Los triggers de confirmación/protección lanzan RAISE EXCEPTION con mensajes en
// español ya listos para mostrar (código P0001) — solo hay que bajarlos a 400 en
// vez de dejarlos como 500 genérico.
function statusForDbError(code: string | undefined) {
  return code === 'P0001' ? 400 : 500
}

export async function listTurnos(event: H3Event): Promise<Turno[]> {
  const client = await serverSupabaseClient(event)
  const { data, error } = await client
    .from('turnos')
    .select(TURNO_SELECT)
    .order('dia', { ascending: true })
    .order('hora_entrada_programada', { ascending: true })
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return (data ?? []).map(toTurno)
}

export async function createTurno(
  event: H3Event,
  payload: {
    empleadoId: string
    puntoVentaId: string
    dia: string
    horaEntradaProgramada: string
    horaSalidaProgramada: string
  },
): Promise<Turno> {
  if (!payload.empleadoId || !payload.puntoVentaId || !payload.dia) {
    throw createError({ statusCode: 400, statusMessage: 'Empleado, punto de venta y día son obligatorios' })
  }
  if (!payload.horaEntradaProgramada || !payload.horaSalidaProgramada) {
    throw createError({ statusCode: 400, statusMessage: 'La hora de entrada y salida son obligatorias' })
  }
  if (payload.horaEntradaProgramada === payload.horaSalidaProgramada) {
    throw createError({ statusCode: 400, statusMessage: 'La hora de entrada y salida no pueden ser iguales' })
  }

  const client = await serverSupabaseClient(event)
  const user = await serverSupabaseUser(event)

  const { data, error } = await client
    .from('turnos')
    .insert({
      empleado_id: payload.empleadoId,
      punto_venta_id: payload.puntoVentaId,
      dia: payload.dia,
      hora_entrada_programada: payload.horaEntradaProgramada,
      hora_salida_programada: payload.horaSalidaProgramada,
      creado_por: user?.sub,
    })
    .select(TURNO_SELECT)
    .single()

  if (error || !data) {
    throw createError({ statusCode: 500, statusMessage: error?.message ?? 'No se pudo crear el turno' })
  }
  return toTurno(data)
}

export async function updateTurno(
  event: H3Event,
  id: string,
  patch: {
    dia?: string
    horaEntradaProgramada?: string
    horaSalidaProgramada?: string
    puntoVentaId?: string
    empleadoId?: string
    horaEntradaReal?: string
    horaSalidaReal?: string
    confirmar?: boolean
  },
): Promise<Turno> {
  const update: Record<string, string> = {}
  if (patch.dia !== undefined) update.dia = patch.dia
  if (patch.horaEntradaProgramada !== undefined) update.hora_entrada_programada = patch.horaEntradaProgramada
  if (patch.horaSalidaProgramada !== undefined) update.hora_salida_programada = patch.horaSalidaProgramada
  if (patch.puntoVentaId !== undefined) update.punto_venta_id = patch.puntoVentaId
  if (patch.empleadoId !== undefined) update.empleado_id = patch.empleadoId
  if (patch.horaEntradaReal !== undefined) update.hora_entrada_real = patch.horaEntradaReal
  if (patch.horaSalidaReal !== undefined) update.hora_salida_real = patch.horaSalidaReal
  if (patch.confirmar) update.estado = 'confirmado'

  if (Object.keys(update).length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Nada para actualizar' })
  }

  const client = await serverSupabaseClient(event)
  const { data, error } = await client.from('turnos').update(update).eq('id', id).select(TURNO_SELECT).single()

  if (error) {
    throw createError({ statusCode: statusForDbError(error.code), statusMessage: error.message })
  }
  if (!data) throw createError({ statusCode: 404, statusMessage: 'Turno no encontrado' })
  return toTurno(data)
}

export async function deleteTurno(event: H3Event, id: string): Promise<void> {
  const client = await serverSupabaseClient(event)
  const { error } = await client.from('turnos').delete().eq('id', id)
  if (error) {
    throw createError({ statusCode: statusForDbError(error.code), statusMessage: error.message })
  }
}

export async function getResumenPago(
  event: H3Event,
  range: { desde: string; hasta: string },
): Promise<ResumenPagoEmpleado[]> {
  const client = await serverSupabaseClient(event)

  const [{ data: horas, error: horasError }, { data: profiles, error: profilesError }] = await Promise.all([
    client
      .from('horas_trabajadas')
      .select('empleado_id, horas, total_pagar')
      .gte('dia', range.desde)
      .lte('dia', range.hasta),
    client.from('profiles').select('id, nombre, tarifa_hora'),
  ])

  if (horasError) throw createError({ statusCode: 500, statusMessage: horasError.message })
  if (profilesError) throw createError({ statusCode: 500, statusMessage: profilesError.message })

  const nombreById = new Map((profiles ?? []).map((p) => [p.id, p.nombre]))
  const tarifaById = new Map((profiles ?? []).map((p) => [p.id, p.tarifa_hora]))

  const totals = new Map<string, { horas: number; total: number }>()
  for (const row of horas ?? []) {
    const current = totals.get(row.empleado_id) ?? { horas: 0, total: 0 }
    current.horas += row.horas
    current.total += row.total_pagar
    totals.set(row.empleado_id, current)
  }

  return Array.from(totals.entries())
    .map(([empleadoId, { horas: horasTotales, total: totalPagar }]) => ({
      empleadoId,
      empleadoNombre: nombreById.get(empleadoId) ?? 'Sin nombre',
      horasTotales,
      totalPagar,
      tarifaHora: tarifaById.get(empleadoId) ?? 0,
    }))
    .sort((a, b) => b.totalPagar - a.totalPagar)
}
