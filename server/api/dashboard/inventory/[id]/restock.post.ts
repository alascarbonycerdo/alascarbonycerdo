export default defineEventHandler(async (event) => {
  const dishId = getRouterParam(event, 'id')!
  const body = await readBody<{ amount: number; note?: string }>(event)
  return restock(dishId, Number(body.amount), body.note)
})
