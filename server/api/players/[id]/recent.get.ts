import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'Player ID required' })
  }

  const query = getQuery(event)
  const limit = query.limit ? Number(query.limit) : 5

  const client = await serverSupabaseClient(event)

  const { data, error } = await client
    .from('game_players')
    .select(`
      game_id,
      is_mvp,
      alignment_start,
      alignment_end,
      ending_role:roles!ending_role_id(
        name_ua, image_url, type
      ),
      starting_role:roles!starting_role_id(
        name_ua, image_url, type
      ),
      game:games!inner!game_id(
        id, date, script, status, winner, created_at
      )
    `)
    .eq('player_id', id)
    .eq('game.status', 'finished')
    .order('game(date)', { ascending: false })
    .limit(limit)

  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }

  return data
})
