export default defineEventHandler(async (event) => {
  const body = await readBody<{ dishId: string; qty: number }>(event)
  return recordSale(body.dishId, Number(body.qty))
})
