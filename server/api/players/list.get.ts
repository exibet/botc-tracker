import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)

  const { data, error } = await client
    .from('profiles')
    .select('id, nickname, avatar_url, role, is_manual, created_at')
    .order('nickname')

  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }

  return data
})
