import type { ResumenPagoEmpleado, Turno } from '#shared/types/horario'

export interface CreateTurnoPayload {
  empleadoId: string
  puntoVentaId: string
  dia: string
  horaEntradaProgramada: string
  horaSalidaProgramada: string
}

export interface UpdateTurnoPayload {
  dia?: string
  horaEntradaProgramada?: string
  horaSalidaProgramada?: string
  puntoVentaId?: string
  empleadoId?: string
  horaEntradaReal?: string
  horaSalidaReal?: string
  confirmar?: boolean
}

export const useHorarios = () => {
  const turnos = useState<Turno[]>('horarios-turnos', () => [])
  const pending = useState('horarios-pending', () => false)
  const error = useState<string | null>('horarios-error', () => null)

  const resumen = useState<ResumenPagoEmpleado[]>('horarios-resumen', () => [])
  const resumenPending = useState('horarios-resumen-pending', () => false)
  const resumenError = useState<string | null>('horarios-resumen-error', () => null)

  const requestFetch = useRequestFetch()

  const load = async () => {
    pending.value = true
    error.value = null
    try {
      turnos.value = await requestFetch<Turno[]>('/api/dashboard/turnos')
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'No se pudieron cargar los turnos'
    } finally {
      pending.value = false
    }
    return true
  }

  const createTurno = async (payload: CreateTurnoPayload) => {
    await $fetch('/api/admin/turnos', { method: 'POST', body: payload })
    await load()
  }

  const updateTurno = async (id: string, payload: UpdateTurnoPayload) => {
    await $fetch(`/api/admin/turnos/${id}`, { method: 'PATCH', body: payload })
    await load()
  }

  const confirmTurno = async (id: string, horaEntradaReal: string, horaSalidaReal: string) => {
    await updateTurno(id, { horaEntradaReal, horaSalidaReal, confirmar: true })
  }

  const deleteTurno = async (id: string) => {
    await $fetch(`/api/admin/turnos/${id}`, { method: 'DELETE' })
    await load()
  }

  const loadResumen = async (desde: string, hasta: string) => {
    resumenPending.value = true
    resumenError.value = null
    try {
      resumen.value = await requestFetch<ResumenPagoEmpleado[]>('/api/admin/turnos/resumen', { query: { desde, hasta } })
    } catch (e) {
      resumenError.value = e instanceof Error ? e.message : 'No se pudo cargar el resumen de pago'
    } finally {
      resumenPending.value = false
    }
    return true
  }

  return {
    turnos,
    pending,
    error,
    load,
    createTurno,
    updateTurno,
    confirmTurno,
    deleteTurno,
    resumen,
    resumenPending,
    resumenError,
    loadResumen,
  }
}
