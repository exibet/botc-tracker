import type { Script, Winner } from '~/types'

export interface RecentGame {
  gameId: string
  date: string
  script: Script
  roleName: string
  roleImageUrl: string | null
  roleType: string
  winner: Winner | null
  won: boolean
  isMvp: boolean
}

export function usePlayerRecentGames(playerId: string, limit = 5) {
  const client = useSupabaseClient()
  const games = ref<RecentGame[]>()
  const loading = ref(true)

  async function fetch() {
    loading.value = true
    try {
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
        .eq('player_id', playerId)
        .eq('game.status', 'finished')
        .order('game(date)', { ascending: false })
        .limit(limit)

      if (error) throw error

      games.value = (data as any[])
        .map((r) => {
          const role = r.ending_role ?? r.starting_role
          const alignment = r.alignment_end ?? r.alignment_start
          return {
            gameId: r.game.id,
            date: r.game.date,
            script: r.game.script,
            roleName: role?.name_ua ?? '?',
            roleImageUrl: role?.image_url ?? null,
            roleType: role?.type ?? 'townsfolk',
            winner: r.game.winner,
            won: alignment === r.game.winner,
            isMvp: r.is_mvp,
          }
        })
    }
    finally {
      loading.value = false
    }
  }

  fetch()

  return { games, loading }
}
