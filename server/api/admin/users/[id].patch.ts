import { serverSupabaseClient, serverSupabaseServiceRole } from '#supabase/server'

const VALID_ROLES = ['cliente', 'vendedor', 'administrador']

interface UpdateUserBody {
  nombre?: string
  role?: string
  email?: string
  password?: string
  puntoVentaId?: string | null
}

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const id = getRouterParam(event, 'id')!
  const body = await readBody<UpdateUserBody>(event)

  if (body.role && !VALID_ROLES.includes(body.role)) {
    throw createError({ statusCode: 400, statusMessage: 'Rol inválido' })
  }
  if (body.password && body.password.length < 6) {
    throw createError({ statusCode: 400, statusMessage: 'La contraseña debe tener al menos 6 caracteres' })
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

  // Nombre, rol y punto de venta viven en profiles: RLS ya permite al admin editar cualquier fila.
  if (body.nombre !== undefined || body.role || body.puntoVentaId !== undefined) {
    const client = await serverSupabaseClient(event)
    const patch: Record<string, string | null> = {}
    if (body.nombre !== undefined) patch.nombre = body.nombre
    if (body.role) patch.role = body.role
    if (body.puntoVentaId !== undefined) patch.punto_venta_id = body.puntoVentaId

    const { error } = await client.from('profiles').update(patch).eq('id', id)
    if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return { ok: true }
})
