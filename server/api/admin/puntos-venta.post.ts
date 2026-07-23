export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readBody<{ nombre: string; direccion?: string }>(event)
  return createPuntoVenta(event, body)
})
