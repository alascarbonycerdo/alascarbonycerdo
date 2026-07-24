export interface Turno {
  id: string
  empleadoId: string
  empleadoNombre: string
  puntoVentaId: string
  puntoVentaNombre: string
  dia: string
  horaEntradaProgramada: string
  horaSalidaProgramada: string
  horaEntradaReal: string | null
  horaSalidaReal: string | null
  estado: 'programado' | 'confirmado'
  createdAt: string
}

export interface ResumenPagoEmpleado {
  empleadoId: string
  empleadoNombre: string
  horasTotales: number
  totalPagar: number
  tarifaHora: number
}
