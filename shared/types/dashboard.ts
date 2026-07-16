export interface InventoryItem {
  id: string
  name: string
  detail?: string
  /** Gramos de proteína cruda que consume una venta de este plato. */
  consumptionPerSale: number
  /** Gramos actualmente en stock. */
  currentStock: number
}

export interface Movement {
  id: string
  date: string
  time: string
  dishId: string
  type: 'restock' | 'sale'
  amount: number
  note?: string
}

export interface SaleRecord {
  id: string
  date: string
  time: string
  dishId: string
  dishName: string
  qty: number
  unitPriceThousands: number
  totalThousands: number
}

export interface DaySummary {
  date: string
  label: string
  revenueThousands: number
  itemsSold: number
  proteinConsumedGrams: number
}
