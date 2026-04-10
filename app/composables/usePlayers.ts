import type { Profile, PlayerWithStats } from '~/types'
import type { GamePlayerStatsRow } from '~/utils/stats'
import {
  aggregatePlayerStats,
  computeWinStreaks,
} from '~/utils/stats'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseRpc = (...args: any[]) => any

export function usePlayers() {
  const client = useSupabaseClient()
  const rpc = (client as unknown as { rpc: SupabaseRpc }).rpc
    .bind(client)

  const {
    data: players,
    status,
    refresh: refreshPlayers,
  } = useAsyncData('players', async () => {
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

  async function linkProfile(
    manualId: string,
    authId: string,
  ) {
    const { error } = await rpc('link_manual_profile', {
      manual_id: manualId,
      auth_id: authId,
    })
    if (error) throw error
  }

  async function unlinkProfile(
    authId: string,
    nickname: string,
  ) {
    const { data, error } = await rpc('unlink_profile', {
      auth_id: authId,
      manual_nickname: nickname,
    })
    if (error) throw error
    return data as string
  }

  return {
    players,
    status,
    refreshPlayers,
    createManual,
    linkProfile,
    unlinkProfile,
  }
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
          game:games!game_id(date, winner, status)
        `)

      if (gamesError) throw gamesError

      const typedRows
        = gameRows as unknown as GamePlayerStatsRow[]
      const statsMap = aggregatePlayerStats(typedRows)
      const streakMap = computeWinStreaks(typedRows)

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
            winStreak: streakMap.get(p.id) ?? 0,
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
