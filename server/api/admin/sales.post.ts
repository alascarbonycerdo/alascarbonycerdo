export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readBody<{ dishId: string; qty: number; fecha: string }>(event)
  if (!body.fecha) {
    throw createError({ statusCode: 400, statusMessage: 'La fecha es obligatoria' })
  }
  return recordSale(event, body.dishId, Number(body.qty), body.fecha)
})
