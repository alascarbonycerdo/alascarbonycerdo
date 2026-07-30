import type { DaySummary, InventoryItem } from '#shared/types/dashboard'
import type { Pedido } from '#shared/types/pedido'

export const useDashboard = () => {
  const inventory = useState<InventoryItem[]>('dashboard-inventory', () => [])
  const todayPedidos = useState<Pedido[]>('dashboard-today-pedidos', () => [])
  const weeklySummary = useState<DaySummary[]>('dashboard-weekly-summary', () => [])
  const pending = useState('dashboard-pending', () => false)
  const error = useState<string | null>('dashboard-error', () => null)

  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota' }).format(new Date())

  // $fetch normal no reenvía la cookie de sesión cuando esta llamada corre en el
  // servidor (SSR de la primera carga); useRequestFetch sí la reenvía.
  const requestFetch = useRequestFetch()

  const refresh = async () => {
    pending.value = true
    error.value = null
    try {
      const [inventoryRes, pedidosRes, summaryRes] = await Promise.all([
        requestFetch<InventoryItem[]>('/api/dashboard/inventory'),
        requestFetch<Pedido[]>('/api/dashboard/pedidos', { query: { date: today } }),
        requestFetch<DaySummary[]>('/api/dashboard/summary', { query: { days: 7 } }),
      ])
      inventory.value = inventoryRes
      todayPedidos.value = pedidosRes
      weeklySummary.value = summaryRes
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'No se pudo cargar el dashboard'
    } finally {
      pending.value = false
    }
    return true
  }

  const registerPedido = async (items: { dishId: string; cantidad: number }[]) => {
    await $fetch('/api/dashboard/pedidos', { method: 'POST', body: { items } })
    await refresh()
  }

  const addStock = async (dishId: string, amount: number, note?: string) => {
    await $fetch(`/api/dashboard/inventory/${dishId}/restock`, {
      method: 'POST',
      body: { amount, note },
    })
    await refresh()
  }

  const removeStock = async (dishId: string, amount: number, note?: string) => {
    await $fetch(`/api/dashboard/inventory/${dishId}/remove`, {
      method: 'POST',
      body: { amount, note },
    })
    await refresh()
  }

  const updateInventoryConfig = async (
    itemId: string,
    patch: { dishId?: string; consumptionPerSale?: number; unitsPerPackage?: number },
  ) => {
    await $fetch(`/api/dashboard/inventory/${itemId}`, { method: 'PATCH', body: patch })
    await refresh()
  }

  const todayRevenueThousands = computed(() =>
    todayPedidos.value.reduce((sum, pedido) => sum + pedido.totalMiles, 0),
  )

  const todayItemsSold = computed(() =>
    todayPedidos.value.reduce((sum, pedido) => sum + pedido.itemsCount, 0),
  )

  const lowStockCount = computed(
    () =>
      inventory.value.filter((item) => {
        const minConsumption = Math.min(...item.dishes.map((d) => d.consumptionPerSale), Infinity)
        return Number.isFinite(minConsumption) && item.currentStock < minConsumption
      }).length,
  )

  return {
    inventory,
    todayPedidos,
    weeklySummary,
    pending,
    error,
    today,
    refresh,
    registerPedido,
    addStock,
    removeStock,
    updateInventoryConfig,
    todayRevenueThousands,
    todayItemsSold,
    lowStockCount,
  }
}
