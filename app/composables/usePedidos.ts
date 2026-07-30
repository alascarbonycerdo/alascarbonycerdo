import type { Pedido } from '#shared/types/pedido'

/** Historial de pedidos acotado a un día, con creación retrodatada y borrado (admin). */
export const usePedidos = () => {
  const date = useState(
    'pedidos-history-date',
    () => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota' }).format(new Date()),
  )
  const pedidos = useState<Pedido[]>('pedidos-history-list', () => [])
  const pending = useState('pedidos-history-pending', () => false)
  const error = useState<string | null>('pedidos-history-error', () => null)

  const requestFetch = useRequestFetch()

  const load = async () => {
    pending.value = true
    error.value = null
    try {
      pedidos.value = await requestFetch<Pedido[]>('/api/dashboard/pedidos', { query: { date: date.value } })
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'No se pudieron cargar los pedidos'
    } finally {
      pending.value = false
    }
    return true
  }

  const removePedido = async (id: string) => {
    await $fetch(`/api/dashboard/pedidos/${id}`, { method: 'DELETE' })
    await load()
  }

  const addBackdatedPedido = async (items: { dishId: string; cantidad: number }[], fecha: string) => {
    await $fetch('/api/dashboard/pedidos', { method: 'POST', body: { items, fecha } })
    await load()
  }

  const totalMiles = computed(() => pedidos.value.reduce((sum, pedido) => sum + pedido.totalMiles, 0))

  return { date, pedidos, pending, error, load, removePedido, addBackdatedPedido, totalMiles }
}
