export default defineEventHandler(async (event) => {
  await requireUser(event)
  const dishId = getRouterParam(event, 'id')!
  const body = await readBody<{ consumptionPerSale: number }>(event)
  return updateConsumption(event, dishId, Number(body.consumptionPerSale))
})
