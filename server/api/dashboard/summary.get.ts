export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const days = query.days ? Number(query.days) : 7
  return getWeeklySummary(days)
})
