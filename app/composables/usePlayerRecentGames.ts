import type { Script, Winner } from '#shared/types'
import { API } from '#shared/api'
import { FETCH_KEY } from '#shared/fetch-keys'

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

interface RawRow {
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
}

function mapRow(r: RawRow): RecentGame {
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
}

export function usePlayerRecentGames(
  playerId: string,
  limit = 5,
) {
  const { data: games, status } = useFetch<RawRow[]>(
    API.PLAYER_RECENT(playerId),
    {
      key: FETCH_KEY.PLAYER_RECENT(playerId),
      query: { limit },
      transform: (rows: RawRow[]) => rows.map(mapRow),
      default: () => [],
    },
  )

  const loading = computed(() => status.value === 'pending')

  return { games, loading }
}
