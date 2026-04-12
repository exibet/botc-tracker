import type { GameWithDetails, PlayerWithStats } from '~/types'
import { GAME_LIST_SELECT, GAME_DETAIL_SELECT } from '~/utils/queries'
import { mapLeaderboardRow } from '~/utils/stats'

const TOP_PLAYERS_COUNT = 5

export function useHome() {
  const client = useSupabaseClient()

  const { data, status, refresh } = useAsyncData(
    'home',
    async () => {
      const [
        activeGamesRes,
        recentGamesRes,
        leaderboardRes,
      ] = await Promise.all([
        client
          .from('games')
          .select(GAME_DETAIL_SELECT)
          .in('status', ['in_progress', 'upcoming'])
          .order('date', { ascending: false })
          .order('created_at', { ascending: false }),
        client
          .from('games')
          .select(GAME_LIST_SELECT)
          .eq('status', 'finished')
          .order('date', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(10),
        client.rpc('get_player_leaderboard', {
          result_limit: TOP_PLAYERS_COUNT,
        }),
      ])

      if (activeGamesRes.error) throw activeGamesRes.error
      if (recentGamesRes.error) throw recentGamesRes.error
      if (leaderboardRes.error) throw leaderboardRes.error

      const activeGames
        = activeGamesRes.data as GameWithDetails[]

      const inProgressGames = activeGames
        .filter(g => g.status === 'in_progress')
        .sort((a, b) =>
          b.date.localeCompare(a.date),
        )
      const upcomingGames = activeGames
        .filter(g => g.status === 'upcoming')
        .sort((a, b) =>
          a.date.localeCompare(b.date),
        )
      const recentGames
        = recentGamesRes.data as GameWithDetails[]

      const topPlayers: PlayerWithStats[]
        = (leaderboardRes.data ?? [])
          .map(mapLeaderboardRow)

      return {
        inProgressGames,
        upcomingGames,
        recentGames,
        topPlayers,
      }
    },
  )

  return { data, status, refresh }
}
