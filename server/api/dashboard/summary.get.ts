export default defineEventHandler(async (event) => {
  await requireUser(event)
  const query = getQuery(event)
  const days = query.days ? Number(query.days) : 7
  return getWeeklySummary(event, days)
})
