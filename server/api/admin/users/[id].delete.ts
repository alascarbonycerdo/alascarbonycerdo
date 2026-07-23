import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)

  const id = getRouterParam(event, 'id')!
  if (id === admin.sub) {
    throw createError({ statusCode: 400, statusMessage: 'No puedes eliminar tu propia cuenta' })
  }

  const serviceClient = serverSupabaseServiceRole(event)
  const { error } = await serviceClient.auth.admin.deleteUser(id)
  if (error) throw createError({ statusCode: 400, statusMessage: error.message })

  return { ok: true }
})
