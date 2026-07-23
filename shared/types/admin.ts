export interface StaffUser {
  id: string
  email: string
  nombre: string | null
  role: string
  createdAt: string
  puntoVentaId: string | null
  puntoVentaNombre: string | null
}
