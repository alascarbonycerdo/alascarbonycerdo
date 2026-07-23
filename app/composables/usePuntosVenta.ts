import type { PuntoVentaSummary } from '#shared/types/puntoVenta'

export interface CreatePuntoVentaPayload {
  nombre: string
  direccion?: string
}

export interface UpdatePuntoVentaPayload {
  nombre?: string
  direccion?: string
  activo?: boolean
}

export const usePuntosVenta = () => {
  const puntos = useState<PuntoVentaSummary[]>('admin-puntos-venta', () => [])
  const pending = useState('admin-puntos-venta-pending', () => false)
  const error = useState<string | null>('admin-puntos-venta-error', () => null)

  const requestFetch = useRequestFetch()

  const load = async () => {
    pending.value = true
    error.value = null
    try {
      puntos.value = await requestFetch<PuntoVentaSummary[]>('/api/admin/puntos-venta')
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'No se pudieron cargar los puntos de venta'
    } finally {
      pending.value = false
    }
    return true
  }

  const createPunto = async (payload: CreatePuntoVentaPayload) => {
    await $fetch('/api/admin/puntos-venta', { method: 'POST', body: payload })
    await load()
  }

  const updatePunto = async (id: string, payload: UpdatePuntoVentaPayload) => {
    await $fetch(`/api/admin/puntos-venta/${id}`, { method: 'PATCH', body: payload })
    await load()
  }

  const activePuntos = computed(() => puntos.value.filter((p) => p.activo))

  return { puntos, activePuntos, pending, error, load, createPunto, updatePunto }
}
