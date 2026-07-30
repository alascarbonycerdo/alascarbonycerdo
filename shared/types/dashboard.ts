export interface InventoryDishUsage {
  dishId: string
  dishName: string
  /** Unidades que consume una venta de este plato. */
  consumptionPerSale: number
}

export interface InventoryItem {
  id: string
  name: string
  detail?: string
  /** Unidades actualmente en stock. */
  currentStock: number
  /** Unidades que suma cada paquete al reabastecer (ej: 1 bolsa = 6 alas). */
  unitsPerPackage: number
  /** Platos que se descuentan de este insumo compartido y cuánto consume cada uno. */
  dishes: InventoryDishUsage[]
}

export interface Movement {
  id: string
  date: string
  time: string
  dishId: string
  type: 'restock' | 'sale' | 'merma'
  amount: number
  note?: string
}

export interface DaySummary {
  date: string
  label: string
  revenueThousands: number
  itemsSold: number
  /** Unidades de inventario consumidas ese día (pedidos menos reversiones). */
  unitsConsumed: number
}
