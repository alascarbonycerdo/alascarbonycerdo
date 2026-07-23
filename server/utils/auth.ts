import type { H3Event } from 'h3'
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export async function requireUser(event: H3Event) {
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'No autenticado' })
  }

  const client = await serverSupabaseClient(event)
  const { data } = await client.from('profiles').select('activo').eq('id', user.sub).single()
  if (data?.activo === false) {
    throw createError({ statusCode: 403, statusMessage: 'Tu cuenta está inactiva. Contacta a un administrador.' })
  }

  return user
}
