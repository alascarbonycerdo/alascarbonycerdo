export const formatCOP = (thousands: number) =>
  (thousands * 1000).toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  })

/** Formatea un valor en pesos (no en miles), para el costeo de insumos. */
export const formatCurrency = (pesos: number) =>
  pesos.toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  })
