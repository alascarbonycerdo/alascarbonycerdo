import type { DaySummary, InventoryItem, SaleRecord } from '#shared/types/dashboard'

export const useDashboard = () => {
  const inventory = useState<InventoryItem[]>('dashboard-inventory', () => [])
  const todaySales = useState<SaleRecord[]>('dashboard-today-sales', () => [])
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
      const [inventoryRes, salesRes, summaryRes] = await Promise.all([
        requestFetch<InventoryItem[]>('/api/dashboard/inventory'),
        requestFetch<SaleRecord[]>('/api/dashboard/sales', { query: { date: today } }),
        requestFetch<DaySummary[]>('/api/dashboard/summary', { query: { days: 7 } }),
      ])
      inventory.value = inventoryRes
      todaySales.value = salesRes
      weeklySummary.value = summaryRes
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'No se pudo cargar el dashboard'
    } finally {
      pending.value = false
    }
    return true
  }

  const registerSale = async (dishId: string, qty: number) => {
    await $fetch('/api/dashboard/sales', { method: 'POST', body: { dishId, qty } })
    await refresh()
  }

  const addStock = async (dishId: string, amount: number, note?: string) => {
    await $fetch(`/api/dashboard/inventory/${dishId}/restock`, {
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
    todaySales.value.reduce((sum, sale) => sum + sale.totalThousands, 0),
  )

  const todayItemsSold = computed(() => todaySales.value.reduce((sum, sale) => sum + sale.qty, 0))

  const lowStockCount = computed(
    () =>
      inventory.value.filter((item) => {
        const minConsumption = Math.min(...item.dishes.map((d) => d.consumptionPerSale), Infinity)
        return Number.isFinite(minConsumption) && item.currentStock < minConsumption
      }).length,
  )

  return {
    inventory,
    todaySales,
    weeklySummary,
    pending,
    error,
    today,
    refresh,
    registerSale,
    addStock,
    updateInventoryConfig,
    todayRevenueThousands,
    todayItemsSold,
    lowStockCount,
  }
}
