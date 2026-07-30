export interface PedidoItem {
  dishId: string
  dishNombre: string
  cantidad: number
  precioUnitarioMiles: number
  subtotalMiles: number
}

export interface Pedido {
  id: string
  /** Fecha en zona Bogotá (YYYY-MM-DD), para agrupar por día. */
  date: string
  /** Hora en zona Bogotá (HH:mm). */
  time: string
  responsableId: string | null
  responsableNombre: string | null
  puntoVentaId: string
  puntoVentaNombre: string | null
  totalMiles: number
  /** Total de platos del pedido (suma de cantidades). */
  itemsCount: number
  createdAt: string
  items: PedidoItem[]
}
