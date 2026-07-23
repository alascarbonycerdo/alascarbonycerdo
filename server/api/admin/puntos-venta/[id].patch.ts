export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id')!
  const body = await readBody<{ nombre?: string; direccion?: string; activo?: boolean }>(event)
  await updatePuntoVenta(event, id, body)
  return { ok: true }
})
