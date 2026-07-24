export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const query = getQuery(event)
  const desde = typeof query.desde === 'string' ? query.desde : undefined
  const hasta = typeof query.hasta === 'string' ? query.hasta : undefined
  if (!desde || !hasta) {
    throw createError({ statusCode: 400, statusMessage: 'Los parámetros desde y hasta son obligatorios' })
  }
  return getResumenPago(event, { desde, hasta })
})
