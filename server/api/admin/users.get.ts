import { serverSupabaseServiceRole } from '#supabase/server'
import type { StaffUser } from '#shared/types/admin'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const serviceClient = serverSupabaseServiceRole(event)

  const [
    { data: authData, error: authError },
    { data: profiles, error: profilesError },
    { data: puntos, error: puntosError },
  ] = await Promise.all([
    serviceClient.auth.admin.listUsers(),
    serviceClient.from('profiles').select('id, role, nombre, punto_venta_id, activo, celular, documento, tipo_sangre'),
    serviceClient.from('puntos_venta').select('id, nombre'),
  ])

  if (authError) throw createError({ statusCode: 500, statusMessage: authError.message })
  if (profilesError) throw createError({ statusCode: 500, statusMessage: profilesError.message })
  if (puntosError) throw createError({ statusCode: 500, statusMessage: puntosError.message })

  const profileById = new Map((profiles ?? []).map((p) => [p.id, p]))
  const puntoNombreById = new Map((puntos ?? []).map((p) => [p.id, p.nombre]))

  const users: StaffUser[] = authData.users.map((user) => {
    const profile = profileById.get(user.id)
    return {
      id: user.id,
      email: user.email ?? '',
      nombre: profile?.nombre ?? null,
      role: profile?.role ?? 'vendedor',
      createdAt: user.created_at,
      puntoVentaId: profile?.punto_venta_id ?? null,
      puntoVentaNombre: profile?.punto_venta_id ? (puntoNombreById.get(profile.punto_venta_id) ?? null) : null,
      activo: profile?.activo ?? true,
      celular: profile?.celular ?? null,
      documento: profile?.documento ?? null,
      tipoSangre: profile?.tipo_sangre ?? null,
    }
  })

  users.sort((a, b) => a.email.localeCompare(b.email))

  return users
})
