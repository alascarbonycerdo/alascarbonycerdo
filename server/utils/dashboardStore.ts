import { porkItems, wingsCombos } from '#shared/utils/menu'
import type { DaySummary, InventoryItem, Movement, SaleRecord } from '#shared/types/dashboard'

const TIME_ZONE = 'America/Bogota'

const DEFAULT_CONSUMPTION: Record<string, number> = {
  'wings-3': 300,
  'wings-6': 600,
  'wings-12': 1200,
  chorizo: 150,
  chicharron: 300,
  ceviche: 300,
  costilla: 500,
}

const catalog = [...wingsCombos, ...porkItems]

const storage = () => useStorage('dashboard')

function nowParts() {
  const now = new Date()
  const date = new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE }).format(now)
  const time = new Intl.DateTimeFormat('es-CO', {
    timeZone: TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(now)
  return { date, time }
}

function dayLabel(date: string) {
  const [year = 1970, month = 1, day = 1] = date.split('-').map(Number)
  const asUtc = new Date(Date.UTC(year, month - 1, day))
  const formatted = new Intl.DateTimeFormat('es-CO', {
    weekday: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(asUtc)
  return formatted.replace('.', '')
}

async function seedInventory(): Promise<InventoryItem[]> {
  const seeded: InventoryItem[] = catalog.map((item) => ({
    id: item.id,
    name: item.name,
    detail: item.detail,
    consumptionPerSale: DEFAULT_CONSUMPTION[item.id] ?? 0,
    currentStock: 0,
  }))
  await storage().setItem('inventory.json', seeded)
  return seeded
}

export async function getInventory(): Promise<InventoryItem[]> {
  const existing = await storage().getItem<InventoryItem[]>('inventory.json')
  if (!existing || existing.length === 0) return seedInventory()
  return existing
}

async function saveInventory(items: InventoryItem[]) {
  await storage().setItem('inventory.json', items)
}

export async function getMovements(): Promise<Movement[]> {
  return (await storage().getItem<Movement[]>('movements.json')) ?? []
}

async function appendMovement(movement: Movement) {
  const movements = await getMovements()
  movements.push(movement)
  await storage().setItem('movements.json', movements)
}

export async function getSales(): Promise<SaleRecord[]> {
  return (await storage().getItem<SaleRecord[]>('sales.json')) ?? []
}

async function appendSale(sale: SaleRecord) {
  const sales = await getSales()
  sales.push(sale)
  await storage().setItem('sales.json', sales)
}

export async function restock(dishId: string, amount: number, note?: string): Promise<InventoryItem> {
  if (amount <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'La cantidad debe ser mayor a 0' })
  }

  const items = await getInventory()
  const item = items.find((entry) => entry.id === dishId)
  if (!item) {
    throw createError({ statusCode: 404, statusMessage: 'Plato no encontrado' })
  }

  item.currentStock += amount
  await saveInventory(items)

  const { date, time } = nowParts()
  await appendMovement({
    id: crypto.randomUUID(),
    date,
    time,
    dishId,
    type: 'restock',
    amount,
    note,
  })

  return item
}

export async function updateConsumption(dishId: string, consumptionPerSale: number): Promise<InventoryItem> {
  if (consumptionPerSale < 0) {
    throw createError({ statusCode: 400, statusMessage: 'El consumo no puede ser negativo' })
  }

  const items = await getInventory()
  const item = items.find((entry) => entry.id === dishId)
  if (!item) {
    throw createError({ statusCode: 404, statusMessage: 'Plato no encontrado' })
  }

  item.consumptionPerSale = consumptionPerSale
  await saveInventory(items)
  return item
}

export async function recordSale(dishId: string, qty: number): Promise<{ sale: SaleRecord; inventory: InventoryItem }> {
  if (qty <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'La cantidad debe ser mayor a 0' })
  }

  const dish = catalog.find((entry) => entry.id === dishId)
  if (!dish) {
    throw createError({ statusCode: 404, statusMessage: 'Plato no encontrado' })
  }

  const items = await getInventory()
  const item = items.find((entry) => entry.id === dishId)!

  const consumed = item.consumptionPerSale * qty
  item.currentStock = Math.max(0, item.currentStock - consumed)
  await saveInventory(items)

  const { date, time } = nowParts()

  await appendMovement({
    id: crypto.randomUUID(),
    date,
    time,
    dishId,
    type: 'sale',
    amount: consumed,
  })

  const sale: SaleRecord = {
    id: crypto.randomUUID(),
    date,
    time,
    dishId,
    dishName: dish.name,
    qty,
    unitPriceThousands: dish.priceThousands,
    totalThousands: dish.priceThousands * qty,
  }
  await appendSale(sale)

  return { sale, inventory: item }
}

function lastNDates(days: number): string[] {
  const dates: string[] = []
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date()
    d.setUTCDate(d.getUTCDate() - i)
    dates.push(new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE }).format(d))
  }
  return dates
}

export async function getWeeklySummary(days = 7): Promise<DaySummary[]> {
  const [sales, movements] = await Promise.all([getSales(), getMovements()])
  const dates = lastNDates(days)

  return dates.map((date) => {
    const daySales = sales.filter((sale) => sale.date === date)
    const dayConsumption = movements
      .filter((movement) => movement.date === date && movement.type === 'sale')
      .reduce((sum, movement) => sum + movement.amount, 0)

    return {
      date,
      label: dayLabel(date),
      revenueThousands: daySales.reduce((sum, sale) => sum + sale.totalThousands, 0),
      itemsSold: daySales.reduce((sum, sale) => sum + sale.qty, 0),
      proteinConsumedGrams: dayConsumption,
    }
  })
}
