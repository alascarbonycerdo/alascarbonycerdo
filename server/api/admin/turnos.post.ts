export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readBody<{
    empleadoId: string
    puntoVentaId: string
    dia: string
    horaEntradaProgramada: string
    horaSalidaProgramada: string
  }>(event)
  return createTurno(event, body)
})
