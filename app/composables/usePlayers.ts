import type { Profile, PlayerWithStats } from '~/types'
import type { GamePlayerStatsRow } from '~/utils/stats'
import { aggregatePlayerStats } from '~/utils/stats'

export function usePlayers() {
  const client = useSupabaseClient()

  const { data: players, status } = useAsyncData('players', async () => {
    const { data, error } = await client
      .from('profiles')
      .select('*')
      .order('nickname')

    if (error) throw error
    return data as Profile[]
  })

  async function createManual(nickname: string) {
    const { data, error } = await client
      .from('profiles')
      .insert({
        id: crypto.randomUUID(),
        nickname,
        is_manual: true,
      })
      .select('id')
      .single()

    if (error) throw error
    return data
  }

  return { players, status, createManual }
}

export function usePlayersWithStats() {
  const client = useSupabaseClient()

  const { data: players, status } = useAsyncData(
    'players-with-stats',
    async () => {
      const { data: profiles, error: profilesError } = await client
        .from('profiles')
        .select('*')
        .order('nickname')

      if (profilesError) throw profilesError

      const { data: gameRows, error: gamesError } = await client
        .from('game_players')
        .select(`
          player_id,
          is_mvp,
          alignment_start,
          alignment_end,
          starting_role:roles!starting_role_id(type),
          ending_role:roles!ending_role_id(type),
          game:games!game_id(winner)
        `)

      if (gamesError) throw gamesError

      const statsMap = aggregatePlayerStats(
        gameRows as unknown as GamePlayerStatsRow[],
      )

      return (profiles as Profile[])
        .map((p): PlayerWithStats => {
          const s = statsMap.get(p.id)
          const games = s?.games ?? 0
          const wins = s?.wins ?? 0
          return {
            ...p,
            gamesPlayed: games,
            wins,
            losses: games - wins,
            winRate: games > 0
              ? Math.round((wins / games) * 100)
              : 0,
            mvpCount: s?.mvps ?? 0,
            goodGames: s?.good ?? 0,
            evilGames: s?.evil ?? 0,
            points: s?.points ?? 0,
          }
        })
        .sort((a, b) =>
          b.points - a.points
          || b.gamesPlayed - a.gamesPlayed
          || a.nickname.localeCompare(b.nickname),
        )
    },
  )

  return { players, status }
}
