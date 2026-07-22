export default defineEventHandler(async (event) => {
  await requireUser(event)
  const body = await readBody<{ dishId: string; qty: number }>(event)
  return recordSale(event, body.dishId, Number(body.qty))
})
