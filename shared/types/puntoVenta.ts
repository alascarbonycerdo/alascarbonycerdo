export interface PuntoVenta {
  id: string
  nombre: string
  direccion?: string
  activo: boolean
  createdAt: string
}

export interface PuntoVentaSummary extends PuntoVenta {
  vendedoresCount: number
  todayRevenueThousands: number
  lowStockCount: number
}
