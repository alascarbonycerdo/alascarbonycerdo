export default defineEventHandler(async (event) => {
  await requireUser(event)
  const dishId = getRouterParam(event, 'id')!
  const body = await readBody<{ amount: number; note?: string }>(event)
  return restock(event, dishId, Number(body.amount), body.note)
})
