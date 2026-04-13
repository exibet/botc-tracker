import { serverSupabaseClient } from '#supabase/server'

export default defineCachedEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)

  const { data, error } = await client.rpc('get_home_stats')

  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }

  return data
}, {
  maxAge: 300,
  name: 'stats',
})
