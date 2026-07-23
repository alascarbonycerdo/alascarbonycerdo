export default defineEventHandler(async (event) => {
  await requireUser(event)
  const itemId = getRouterParam(event, 'id')!
  const body = await readBody<{ dishId?: string; consumptionPerSale?: number; unitsPerPackage?: number }>(event)
  return updateInventoryConfig(event, itemId, {
    dishId: body.dishId,
    consumptionPerSale: body.consumptionPerSale !== undefined ? Number(body.consumptionPerSale) : undefined,
    unitsPerPackage: body.unitsPerPackage !== undefined ? Number(body.unitsPerPackage) : undefined,
  })
})
