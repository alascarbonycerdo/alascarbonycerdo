import { serverSupabaseServiceRole } from '#supabase/server'
import type { StaffUser } from '#shared/types/admin'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const serviceClient = serverSupabaseServiceRole(event)

  const [{ data: authData, error: authError }, { data: profiles, error: profilesError }] = await Promise.all([
    serviceClient.auth.admin.listUsers(),
    serviceClient.from('profiles').select('id, role, nombre'),
  ])

  if (authError) throw createError({ statusCode: 500, statusMessage: authError.message })
  if (profilesError) throw createError({ statusCode: 500, statusMessage: profilesError.message })

  const profileById = new Map((profiles ?? []).map((p) => [p.id, p]))

  const users: StaffUser[] = authData.users.map((user) => {
    const profile = profileById.get(user.id)
    return {
      id: user.id,
      email: user.email ?? '',
      nombre: profile?.nombre ?? null,
      role: profile?.role ?? 'vendedor',
      createdAt: user.created_at,
    }
  })

  users.sort((a, b) => a.email.localeCompare(b.email))

  return users
})
