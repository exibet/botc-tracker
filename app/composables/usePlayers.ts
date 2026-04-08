import type { Profile, PlayerWithStats } from '~/types'

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
          game:games!game_id(winner)
        `)

      if (gamesError) throw gamesError

      const statsMap = new Map<string, {
        games: number
        wins: number
        mvps: number
        good: number
        evil: number
      }>()

      for (const row of (gameRows as unknown as {
        player_id: string
        is_mvp: boolean
        alignment_start: string | null
        alignment_end: string | null
        game: { winner: string }
      }[])) {
        const entry = statsMap.get(row.player_id)
          ?? { games: 0, wins: 0, mvps: 0, good: 0, evil: 0 }
        entry.games++
        if (row.is_mvp) entry.mvps++
        const alignment = row.alignment_end ?? row.alignment_start
        if (alignment === row.game.winner) entry.wins++
        if (alignment === 'good') entry.good++
        else if (alignment === 'evil') entry.evil++
        statsMap.set(row.player_id, entry)
      }

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
          }
        })
        .sort((a, b) =>
          b.gamesPlayed - a.gamesPlayed
          || a.nickname.localeCompare(b.nickname),
        )
    },
  )

  return { players, status }
}
