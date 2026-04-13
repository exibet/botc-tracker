import { serverSupabaseClient } from '#supabase/server'

const TOP_PLAYERS_COUNT = 5

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)

  const [activeRes, recentRes, leaderboardRes] = await Promise.all([
    client
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
      .in('status', ['in_progress', 'upcoming'])
      .order('date', { ascending: false })
      .order('created_at', { ascending: false }),
    client
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
      `)
      .eq('status', 'finished')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(10),
    client.rpc('get_player_leaderboard', {
      result_limit: TOP_PLAYERS_COUNT,
    }),
  ])

  if (activeRes.error) {
    throw createError({ statusCode: 500, message: activeRes.error.message })
  }
  if (recentRes.error) {
    throw createError({ statusCode: 500, message: recentRes.error.message })
  }
  if (leaderboardRes.error) {
    throw createError({
      statusCode: 500,
      message: leaderboardRes.error.message,
    })
  }

  const activeGames = activeRes.data ?? []
  const inProgressGames = activeGames
    .filter(g => g.status === 'in_progress')
    .sort((a, b) => b.date.localeCompare(a.date))
  const upcomingGames = activeGames
    .filter(g => g.status === 'upcoming')
    .sort((a, b) => a.date.localeCompare(b.date))

  return {
    inProgressGames,
    upcomingGames,
    recentGames: recentRes.data ?? [],
    topPlayers: leaderboardRes.data ?? [],
  }
})
