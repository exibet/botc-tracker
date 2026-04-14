import { serverSupabaseClient } from '#supabase/server'

export default defineCachedEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)

  const { data, error } = await client.rpc('get_home_stats')

  if (error) {
    throw createError({ statusCode: 500, message: 'Не вдалося завантажити статистику' })
  }

  return data
}, {
  maxAge: 300,
  name: 'stats',
})
