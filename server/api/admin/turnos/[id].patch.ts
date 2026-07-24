export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id')!
  const body = await readBody<{
    dia?: string
    horaEntradaProgramada?: string
    horaSalidaProgramada?: string
    puntoVentaId?: string
    empleadoId?: string
    horaEntradaReal?: string
    horaSalidaReal?: string
    confirmar?: boolean
  }>(event)
  return updateTurno(event, id, body)
})
