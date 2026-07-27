export interface Factura {
  id: string
  fecha: string
  descripcion: string
  valor: number
  puntoVentaId: string | null
  puntoVentaNombre: string | null
  createdAt: string
}

export interface ResumenCompraPeriodo {
  periodo: string
  total: number
}
