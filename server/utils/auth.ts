import type { H3Event } from 'h3'
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export async function requireAuth(event: H3Event) {
  const user = await serverSupabaseUser(event).catch(() => null)
  if (!user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }
  return user
}

export async function requireAdmin(event: H3Event) {
  const user = await requireAuth(event)
  const client = await serverSupabaseClient(event)
  const { data } = await client
    .from('profiles')
    .select('role')
    .eq('id', user.sub)
    .single()

  if (data?.role !== 'admin') {
    throw createError({ statusCode: 403, message: 'Forbidden' })
  }
  return user
}
