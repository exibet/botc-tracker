import { serverSupabaseClient } from '#supabase/server'

const TOP_PLAYERS_COUNT = 5

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)

  const [activeRes, recentRes, leaderboardRes] = await Promise.all([
    client
      .from('games')
      .select(GAME_WITH_DETAILS_SELECT)
      .in('status', ['in_progress', 'upcoming'])
      .order('date', { ascending: false })
      .order('created_at', { ascending: false }),
    client
      .from('games')
      .select(GAME_WITH_DETAILS_SELECT)
      .eq('status', 'finished')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(10),
    client.rpc('get_player_leaderboard', {
      result_limit: TOP_PLAYERS_COUNT,
    }),
  ])

  if (activeRes.error || recentRes.error || leaderboardRes.error) {
    throw createError({ statusCode: 500, message: 'Не вдалося завантажити дані головної сторінки' })
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
