import { serverSupabaseClient, serverSupabaseServiceRole } from '#supabase/server'
import { BLOOD_TYPES } from '#shared/types/admin'

const VALID_ROLES = ['cliente', 'vendedor', 'administrador']

interface UpdateUserBody {
  nombre?: string
  role?: string
  email?: string
  password?: string
  puntoVentaId?: string | null
  activo?: boolean
  celular?: string
  documento?: string
  tipoSangre?: string
}

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)

  const id = getRouterParam(event, 'id')!
  const body = await readBody<UpdateUserBody>(event)

  if (body.role && !VALID_ROLES.includes(body.role)) {
    throw createError({ statusCode: 400, statusMessage: 'Rol inválido' })
  }
  if (body.password && body.password.length < 6) {
    throw createError({ statusCode: 400, statusMessage: 'La contraseña debe tener al menos 6 caracteres' })
  }
  if (body.activo === false && id === admin.sub) {
    throw createError({ statusCode: 400, statusMessage: 'No puedes desactivar tu propia cuenta' })
  }
  if (body.tipoSangre && !BLOOD_TYPES.includes(body.tipoSangre as (typeof BLOOD_TYPES)[number])) {
    throw createError({ statusCode: 400, statusMessage: 'Tipo de sangre inválido' })
  }

  // Correo y contraseña viven en auth.users: solo la Admin API (service role) puede tocarlos.
  if (body.email || body.password) {
    const serviceClient = serverSupabaseServiceRole(event)
    const authUpdate: { email?: string; password?: string; email_confirm?: boolean } = {}
    if (body.email) {
      authUpdate.email = body.email
      authUpdate.email_confirm = true
    }
    if (body.password) authUpdate.password = body.password

    const { error } = await serviceClient.auth.admin.updateUserById(id, authUpdate)
    if (error) throw createError({ statusCode: 400, statusMessage: error.message })
  }

  // Nombre, rol, punto de venta, estado activo y datos de contacto viven en profiles:
  // RLS ya permite al admin editar cualquier fila.
  if (
    body.nombre !== undefined ||
    body.role ||
    body.puntoVentaId !== undefined ||
    body.activo !== undefined ||
    body.celular !== undefined ||
    body.documento !== undefined ||
    body.tipoSangre !== undefined
  ) {
    const client = await serverSupabaseClient(event)
    const patch: Record<string, string | boolean | null> = {}
    if (body.nombre !== undefined) patch.nombre = body.nombre
    if (body.role) patch.role = body.role
    if (body.puntoVentaId !== undefined) patch.punto_venta_id = body.puntoVentaId
    if (body.activo !== undefined) patch.activo = body.activo
    if (body.celular !== undefined) patch.celular = body.celular
    if (body.documento !== undefined) patch.documento = body.documento
    if (body.tipoSangre !== undefined) patch.tipo_sangre = body.tipoSangre

    const { error } = await client.from('profiles').update(patch).eq('id', id)
    if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return { ok: true }
})
