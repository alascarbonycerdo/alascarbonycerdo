import type { H3Event } from 'h3'
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export async function requireAdmin(event: H3Event) {
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'No autenticado' })
  }

  const client = await serverSupabaseClient(event)
  const { data, error } = await client.from('profiles').select('role').eq('id', user.sub).single()

  if (error || data?.role !== 'administrador') {
    throw createError({ statusCode: 403, statusMessage: 'Solo un administrador puede hacer esto' })
  }

  return user
}
