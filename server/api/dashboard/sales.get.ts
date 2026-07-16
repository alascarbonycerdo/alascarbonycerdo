export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const date = typeof query.date === 'string' ? query.date : undefined

  const sales = await getSales()
  if (!date) return sales

  return sales.filter((sale) => sale.date === date)
})
