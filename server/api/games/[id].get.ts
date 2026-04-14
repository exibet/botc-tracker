import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const id = requireUuidParam(event, 'id')

  const client = await serverSupabaseClient(event)

  const { data, error } = await client
    .from('games')
    .select(`
      *,
      storyteller:profiles!storyteller_id(id, nickname),
      created_by_profile:profiles!created_by(id, nickname),
      mvp_player:profiles!mvp_player_id(id, nickname, avatar_url),
      game_players(
        id, game_id, player_id,
        starting_role_id, ending_role_id,
        alignment_start, alignment_end,
        is_alive, is_mvp, added_by, created_at,
        player:profiles!player_id(id, nickname, avatar_url)
      ),
      mvp_votes(id, game_id, voter_id, candidate_id, created_at)
    `)
    .eq('id', id)
    .single()

  if (error) {
    throw createError({ statusCode: 404, message: 'Game not found' })
  }

  return data
})
