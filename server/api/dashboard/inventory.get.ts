export default defineEventHandler(async (event) => {
  await requireUser(event)
  const query = getQuery(event)
  const puntoVentaId = typeof query.puntoVentaId === 'string' ? query.puntoVentaId : undefined
  return getInventory(event, puntoVentaId)
})
