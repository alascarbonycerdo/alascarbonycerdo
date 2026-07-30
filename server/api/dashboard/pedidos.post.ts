export default defineEventHandler(async (event) => {
  await requireUser(event)
  const body = await readBody<{ items: { dishId: string; cantidad: number }[]; fecha?: string }>(event)
  // Retrodatar un pedido queda restringido a administradores dentro de create_pedido,
  // así que la misma ruta sirve para el flujo del día y para corregir el historial.
  return createPedido(event, body.items, body.fecha)
})
