import { serverSupabaseServiceRole } from '#supabase/server'
import { BLOOD_TYPES } from '#shared/types/admin'

const VALID_ROLES = ['cliente', 'vendedor', 'administrador']

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const body = await readBody<{
    email: string
    password: string
    nombre?: string
    role?: string
    puntoVentaId?: string | null
    celular?: string
    documento?: string
    tipoSangre?: string
    tarifaHora?: number
  }>(event)

  if (!body.email || !body.password) {
    throw createError({ statusCode: 400, statusMessage: 'Correo y contraseña son obligatorios' })
  }
  if (body.password.length < 6) {
    throw createError({ statusCode: 400, statusMessage: 'La contraseña debe tener al menos 6 caracteres' })
  }

  const role = body.role ?? 'vendedor'
  if (!VALID_ROLES.includes(role)) {
    throw createError({ statusCode: 400, statusMessage: 'Rol inválido' })
  }
  if (body.tipoSangre && !BLOOD_TYPES.includes(body.tipoSangre as (typeof BLOOD_TYPES)[number])) {
    throw createError({ statusCode: 400, statusMessage: 'Tipo de sangre inválido' })
  }
  if (body.tarifaHora !== undefined && body.tarifaHora < 0) {
    throw createError({ statusCode: 400, statusMessage: 'La tarifa por hora no puede ser negativa' })
  }

  const serviceClient = serverSupabaseServiceRole(event)

  const { data, error } = await serviceClient.auth.admin.createUser({
    email: body.email,
    password: body.password,
    email_confirm: true,
    user_metadata: body.nombre ? { full_name: body.nombre } : undefined,
  })

  if (error || !data.user) {
    throw createError({ statusCode: 400, statusMessage: error?.message ?? 'No se pudo crear el usuario' })
  }

  // El trigger on_auth_user_created ya creó el perfil con role='vendedor' por defecto.
  if (
    role !== 'vendedor' ||
    body.puntoVentaId !== undefined ||
    body.celular !== undefined ||
    body.documento !== undefined ||
    body.tipoSangre !== undefined ||
    body.tarifaHora !== undefined
  ) {
    const patch: {
      role?: string
      punto_venta_id?: string | null
      celular?: string
      documento?: string
      tipo_sangre?: string
      tarifa_hora?: number
    } = {}
    if (role !== 'vendedor') patch.role = role
    if (body.puntoVentaId !== undefined) patch.punto_venta_id = body.puntoVentaId
    if (body.celular !== undefined) patch.celular = body.celular
    if (body.documento !== undefined) patch.documento = body.documento
    if (body.tipoSangre !== undefined) patch.tipo_sangre = body.tipoSangre
    if (body.tarifaHora !== undefined) patch.tarifa_hora = body.tarifaHora
    const { error: patchError } = await serviceClient.from('profiles').update(patch).eq('id', data.user.id)
    if (patchError) throw createError({ statusCode: 500, statusMessage: patchError.message })
  }

  return { id: data.user.id, email: data.user.email, role }
})
