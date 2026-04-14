import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const query = getQuery(event)
  const limit = query.limit ? parseLimit(query.limit) : undefined

  const { data, error } = await client.rpc(
    'get_player_leaderboard',
    limit ? { result_limit: limit } : undefined,
  )

  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }

  return data ?? []
})
