import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const query = getQuery(event)

  const limit = parseLimit(query.limit, 50, 100)
  const page = Math.max(1, Math.floor(Number(query.page) || 1))
  const offset = (page - 1) * limit

  const { data, error, count } = await client
    .from('games')
    .select(`
      *,
      storyteller:profiles!storyteller_id(id, nickname),
      created_by_profile:profiles!created_by(id, nickname),
      mvp_player:profiles!mvp_player_id(id, nickname, avatar_url),
      game_players(
        is_mvp,
        starting_role:roles!starting_role_id(type),
        player:profiles!player_id(id, nickname, avatar_url)
      )
    `, { count: 'exact' })
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }

  return { data: data ?? [], total: count ?? 0 }
})
