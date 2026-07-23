export default defineEventHandler(async (event) => {
  await requireUser(event)
  const query = getQuery(event)
  const days = query.days ? Number(query.days) : 7
  const puntoVentaId = typeof query.puntoVentaId === 'string' ? query.puntoVentaId : undefined
  return getWeeklySummary(event, days, puntoVentaId)
})
