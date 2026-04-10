import type { GameWithDetails, PlayerWithStats } from '~/types'
import type { GamePlayerStatsRow } from '~/utils/stats'
import {
  aggregatePlayerStats,
  computeWinStreaks,
} from '~/utils/stats'

import { GAME_SELECT } from '~/utils/queries'

const MIN_GAMES_FOR_TOP = 1
const TOP_PLAYERS_COUNT = 5

export function useHome() {
  const client = useSupabaseClient()

  const { data, status, refresh } = useAsyncData(
    'home',
    async () => {
      const [gamesRes, profilesRes, gamePlayersRes]
        = await Promise.all([
          client
            .from('games')
            .select(GAME_SELECT)
            .order('date', { ascending: false }),
          client
            .from('profiles')
            .select('id, nickname, avatar_url'),
          client
            .from('game_players')
            .select(`
              player_id,
              is_mvp,
              alignment_start,
              alignment_end,
              starting_role:roles!starting_role_id(type),
              ending_role:roles!ending_role_id(type),
              game:games!game_id(date, winner, status)
            `),
        ])

      if (gamesRes.error) throw gamesRes.error
      if (profilesRes.error) throw profilesRes.error
      if (gamePlayersRes.error) throw gamePlayersRes.error

      const allGames = gamesRes.data as GameWithDetails[]
      const recentGames = allGames.slice(0, 10)

      // Stats only from finished games
      const finishedGames = allGames.filter(
        g => g.status === 'finished',
      )
      const totalGames = finishedGames.length
      const goodWins = finishedGames.filter(
        g => g.winner === 'good',
      ).length
      const evilWins = totalGames - goodWins

      // Aggregate player stats
      const typedRows
        = gamePlayersRes
          .data as unknown as GamePlayerStatsRow[]
      const statsMap = aggregatePlayerStats(typedRows)
      const streakMap = computeWinStreaks(typedRows)

      const profileMap = new Map(
        (profilesRes.data as {
          id: string
          nickname: string
          avatar_url: string | null
        }[]).map(p => [p.id, p]),
      )

      const topPlayers: PlayerWithStats[]
        = Array.from(statsMap.entries())
          .filter(([, s]) =>
            s.games >= MIN_GAMES_FOR_TOP,
          )
          .map(([id, s]) => {
            const p = profileMap.get(id)
            return {
              id,
              nickname: p?.nickname ?? '?',
              avatar_url: p?.avatar_url ?? null,
              role: 'player' as const,
              created_at: '',
              gamesPlayed: s.games,
              wins: s.wins,
              losses: s.games - s.wins,
              winRate: s.games > 0
                ? Math.round(
                    (s.wins / s.games) * 100,
                  )
                : 0,
              mvpCount: s.mvps,
              goodGames: s.good,
              evilGames: s.evil,
              points: s.points,
              winStreak: streakMap.get(id) ?? 0,
            }
          })
          .sort((a, b) =>
            b.points - a.points
            || b.winRate - a.winRate,
          )
          .slice(0, TOP_PLAYERS_COUNT)

      return {
        recentGames,
        totalGames,
        totalPlayers: profilesRes.data.length,
        goodWins,
        evilWins,
        topPlayers,
      }
    },
  )

  return { data, status, refresh }
}
