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
  /** Nombre de quien registró la venta (snapshot al momento de vender). */
  vendedorNombre?: string
}

export interface DaySummary {
  date: string
  label: string
  revenueThousands: number
  itemsSold: number
  /** Unidades de inventario consumidas ese día (ventas menos reversiones). */
  unitsConsumed: number
}
