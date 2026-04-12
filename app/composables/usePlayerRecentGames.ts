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
          game:games!game_id(
            id, date, script, status, winner, created_at
          )
        `)
        .eq('player_id', playerId)

      if (error) throw error

      const rows = data as unknown as {
        game_id: string
        is_mvp: boolean
        alignment_start: string | null
        alignment_end: string | null
        ending_role: {
          name_ua: string
          image_url: string | null
          type: string
        } | null
        starting_role: {
          name_ua: string
          image_url: string | null
          type: string
        } | null
        game: {
          id: string
          date: string
          script: Script
          status: string
          winner: Winner | null
          created_at: string
        }
      }[]

      games.value = rows
        .filter(r => r.game.status === 'finished')
        .sort((a, b) =>
          b.game.date.localeCompare(a.game.date)
          || b.game.created_at.localeCompare(a.game.created_at),
        )
        .slice(0, limit)
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
