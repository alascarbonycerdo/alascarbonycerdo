export default defineEventHandler(async (event) => {
  const dishId = getRouterParam(event, 'id')!
  const body = await readBody<{ consumptionPerSale: number }>(event)
  return updateConsumption(dishId, Number(body.consumptionPerSale))
})
