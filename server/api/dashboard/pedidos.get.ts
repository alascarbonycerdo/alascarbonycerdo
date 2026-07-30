export default defineEventHandler(async (event) => {
  await requireUser(event)
  const query = getQuery(event)
  const date = typeof query.date === 'string' ? query.date : undefined
  const puntoVentaId = typeof query.puntoVentaId === 'string' ? query.puntoVentaId : undefined

  const pedidos = await listPedidos(event, puntoVentaId)
  if (!date) return pedidos
  return pedidos.filter((pedido) => pedido.date === date)
})
