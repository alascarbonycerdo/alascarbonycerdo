export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const dishId = getRouterParam(event, 'id')!
  const body = await readBody<{ amount: number; note?: string }>(event)
  return removeStock(event, dishId, Number(body.amount), body.note)
})
