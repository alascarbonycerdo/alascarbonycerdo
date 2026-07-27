import type { Factura, ResumenCompraPeriodo } from '#shared/types/factura'

export interface CreateFacturaPayload {
  fecha: string
  descripcion: string
  valor: number
  puntoVentaId?: string | null
}

export interface UpdateFacturaPayload {
  fecha?: string
  descripcion?: string
  valor?: number
  puntoVentaId?: string | null
}

export const useFacturas = () => {
  const facturas = useState<Factura[]>('facturas-list', () => [])
  const pending = useState('facturas-pending', () => false)
  const error = useState<string | null>('facturas-error', () => null)

  const resumenSemanal = useState<ResumenCompraPeriodo[]>('facturas-resumen-semanal', () => [])
  const resumenMensual = useState<ResumenCompraPeriodo[]>('facturas-resumen-mensual', () => [])
  const resumenPending = useState('facturas-resumen-pending', () => false)
  const resumenError = useState<string | null>('facturas-resumen-error', () => null)

  const requestFetch = useRequestFetch()

  const load = async () => {
    pending.value = true
    error.value = null
    try {
      facturas.value = await requestFetch<Factura[]>('/api/admin/facturas')
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'No se pudieron cargar las facturas'
    } finally {
      pending.value = false
    }
    return true
  }

  const loadResumen = async () => {
    resumenPending.value = true
    resumenError.value = null
    try {
      const data = await requestFetch<{ semanal: ResumenCompraPeriodo[]; mensual: ResumenCompraPeriodo[] }>(
        '/api/admin/facturas/resumen',
      )
      resumenSemanal.value = data.semanal
      resumenMensual.value = data.mensual
    } catch (e) {
      resumenError.value = e instanceof Error ? e.message : 'No se pudo cargar el histórico de compras'
    } finally {
      resumenPending.value = false
    }
    return true
  }

  const createFactura = async (payload: CreateFacturaPayload) => {
    await $fetch('/api/admin/facturas', { method: 'POST', body: payload })
    await Promise.all([load(), loadResumen()])
  }

  const updateFactura = async (id: string, payload: UpdateFacturaPayload) => {
    await $fetch(`/api/admin/facturas/${id}`, { method: 'PATCH', body: payload })
    await Promise.all([load(), loadResumen()])
  }

  const deleteFactura = async (id: string) => {
    await $fetch(`/api/admin/facturas/${id}`, { method: 'DELETE' })
    await Promise.all([load(), loadResumen()])
  }

  return {
    facturas,
    pending,
    error,
    load,
    createFactura,
    updateFactura,
    deleteFactura,
    resumenSemanal,
    resumenMensual,
    resumenPending,
    resumenError,
    loadResumen,
  }
}
