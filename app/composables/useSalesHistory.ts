import type { SaleRecord } from '#shared/types/dashboard'

export const useSalesHistory = () => {
  const date = useState(
    'sales-history-date',
    () => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota' }).format(new Date()),
  )
  const sales = useState<SaleRecord[]>('sales-history-list', () => [])
  const pending = useState('sales-history-pending', () => false)
  const error = useState<string | null>('sales-history-error', () => null)

  const requestFetch = useRequestFetch()

  const load = async () => {
    pending.value = true
    error.value = null
    try {
      sales.value = await requestFetch<SaleRecord[]>('/api/dashboard/sales', { query: { date: date.value } })
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'No se pudieron cargar las ventas'
    } finally {
      pending.value = false
    }
    return true
  }

  const removeSale = async (id: string) => {
    await $fetch(`/api/dashboard/sales/${id}`, { method: 'DELETE' })
    await load()
  }

  return { date, sales, pending, error, load, removeSale }
}
