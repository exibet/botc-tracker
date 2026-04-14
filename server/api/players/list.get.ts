import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)

  const { data, error } = await client
    .from('profiles')
    .select(PROFILE_SELECT)
    .order('nickname')

  if (error) {
    throw createError({ statusCode: 500, message: 'Не вдалося завантажити гравців' })
  }

  return data
})
