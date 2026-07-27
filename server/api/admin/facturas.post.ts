export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readBody<{ fecha: string; descripcion: string; valor: number; puntoVentaId?: string | null }>(event)
  return createFactura(event, body)
})
