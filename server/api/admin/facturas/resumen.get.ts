export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  return getResumenCompras(event)
})
