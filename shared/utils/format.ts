export const formatCOP = (thousands: number) =>
  (thousands * 1000).toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  })
