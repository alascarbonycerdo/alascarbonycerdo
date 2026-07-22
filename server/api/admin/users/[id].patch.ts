import { serverSupabaseClient } from '#supabase/server'

const VALID_ROLES = ['cliente', 'vendedor', 'administrador']

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const id = getRouterParam(event, 'id')!
  const body = await readBody<{ role: string }>(event)

  if (!VALID_ROLES.includes(body.role)) {
    throw createError({ statusCode: 400, statusMessage: 'Rol inválido' })
  }

  const client = await serverSupabaseClient(event)
  const { data, error } = await client.from('profiles').update({ role: body.role }).eq('id', id).select().maybeSingle()

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  if (!data) throw createError({ statusCode: 404, statusMessage: 'Usuario no encontrado' })

  return data
})
