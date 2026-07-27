export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id')!
  const body = await readBody<{ fecha?: string; descripcion?: string; valor?: number; puntoVentaId?: string | null }>(event)
  return updateFactura(event, id, body)
})
