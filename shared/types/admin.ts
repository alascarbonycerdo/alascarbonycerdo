export const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const
export type BloodType = (typeof BLOOD_TYPES)[number]

export interface StaffUser {
  id: string
  email: string
  nombre: string | null
  role: string
  createdAt: string
  puntoVentaId: string | null
  puntoVentaNombre: string | null
  activo: boolean
  celular: string | null
  documento: string | null
  tipoSangre: string | null
}
