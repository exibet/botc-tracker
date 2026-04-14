import type { H3Event } from 'h3'
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export async function getProfile(event: H3Event) {
  const user = await serverSupabaseUser(event).catch(() => null)
  if (!user) return null

  const client = await serverSupabaseClient(event)
  const { data } = await client
    .from('profiles')
    .select(PROFILE_SELECT)
    .eq('id', user.sub)
    .single()

  return data
}
