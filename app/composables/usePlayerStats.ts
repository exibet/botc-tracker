import type {
  Alignment,
  PlayerGameHistory,
  PlayerStats,
  RolePlayCount,
  RoleType,
  Script,
  Winner,
} from '~/types'
import { computeSinglePlayerStats } from '~/utils/stats'
import { effectiveAlignment } from '~/utils/display'

interface GamePlayerRow {
  game_id: string
  player_id?: string
  alignment_start: Alignment | null
  alignment_end: Alignment | null
  is_alive: boolean | null
  is_mvp: boolean
  starting_role: {
    name_ua: string
    name_en: string
    type: string
    image_url: string | null
  } | null
  ending_role: {
    name_ua: string
    name_en: string
    type: string
    image_url: string | null
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

function incrementRole(
  counts: Map<string, RolePlayCount>,
  role: { name_ua: string, name_en: string, type: string, image_url: string | null },
) {
  const key = role.name_en
  const existing = counts.get(key)
  if (existing) {
    existing.count++
  }
  else {
    counts.set(key, {
      roleName: role.name_ua,
      roleNameEn: role.name_en,
      roleType: role.type as RoleType,
      roleImageUrl: role.image_url,
      count: 1,
    })
  }
}

function computeRolePlayCounts(rows: GamePlayerRow[]): RolePlayCount[] {
  const counts = new Map<string, RolePlayCount>()

  for (const row of rows) {
    // Always count the starting role
    if (row.starting_role) {
      incrementRole(counts, row.starting_role)
    }

    // If ending role exists AND is different from starting role, count it too
    if (
      row.ending_role
      && row.starting_role
      && row.ending_role.name_en !== row.starting_role.name_en
    ) {
      incrementRole(counts, row.ending_role)
    }

    // If only ending role exists (no starting role), count it
    if (row.ending_role && !row.starting_role) {
      incrementRole(counts, row.ending_role)
    }
  }

  return Array.from(counts.values())
    .sort((a, b) => b.count - a.count)
}

function toGameHistory(rows: GamePlayerRow[]): PlayerGameHistory[] {
  return [...rows]
    .filter(r => r.game.status === 'finished')
    .sort((a, b) =>
      b.game.date.localeCompare(a.game.date)
      || b.game.created_at.localeCompare(a.game.created_at),
    )
    .map((row) => {
      const role = row.ending_role ?? row.starting_role
      const alignment = effectiveAlignment(
        row.alignment_end, row.alignment_start,
      ) as Alignment | null

      const hasRoleChange = !!(
        row.starting_role
        && row.ending_role
        && row.ending_role.name_en !== row.starting_role.name_en
      )

      const hasAlignmentChange = !!(
        row.alignment_end
        && row.alignment_end !== row.alignment_start
      )

      const won = alignment && row.game.winner
        ? alignment === row.game.winner
        : null

      return {
        gameId: row.game.id,
        date: row.game.date,
        script: row.game.script,
        roleName: role?.name_ua ?? 'Невідомо',
        roleNameEn: role?.name_en ?? 'Unknown',
        roleType: (role?.type ?? 'townsfolk') as RoleType,
        roleImageUrl: role?.image_url ?? null,
        alignment,
        isAlive: row.is_alive,
        isMvp: row.is_mvp,
        winner: row.game.winner,
        won,
        startingRoleName: row.starting_role?.name_ua ?? null,
        startingRoleNameEn: row.starting_role?.name_en ?? null,
        startingRoleImageUrl: row.starting_role?.image_url ?? null,
        startingRoleType: (row.starting_role?.type ?? null) as RoleType | null,
        endingRoleName: row.ending_role?.name_ua ?? null,
        endingRoleNameEn: row.ending_role?.name_en ?? null,
        endingRoleImageUrl: row.ending_role?.image_url ?? null,
        endingRoleType: (row.ending_role?.type ?? null) as RoleType | null,
        alignmentStart: row.alignment_start,
        alignmentEnd: row.alignment_end,
        hasRoleChange,
        hasAlignmentChange,
      }
    })
}

const SELECT_PLAYER_GAMES = `
  game_id,
  alignment_start,
  alignment_end,
  is_alive,
  is_mvp,
  starting_role:roles!starting_role_id(
    name_ua, name_en, type, image_url
  ),
  ending_role:roles!ending_role_id(
    name_ua, name_en, type, image_url
  ),
  game:games!game_id(
    id, date, script, status, winner, created_at
  )
`

export function usePlayerStats(playerId: Ref<string> | string) {
  const client = useSupabaseClient()
  const id = toRef(playerId)

  const { data: rawData, status } = useAsyncData(
    `player-stats-${id.value}`,
    async () => {
      const { data, error } = await client
        .from('game_players')
        .select(SELECT_PLAYER_GAMES)
        .eq('player_id', id.value)

      if (error) throw error
      return data as any as GamePlayerRow[]
    },
  )

  const stats = computed<PlayerStats>(() =>
    computeSinglePlayerStats(
      (rawData.value ?? []).map(r => ({
        ...r,
        player_id: id.value,
      })),
    ),
  )

  const gameHistory = computed<PlayerGameHistory[]>(() =>
    toGameHistory(rawData.value ?? []),
  )

  const rolePlayCounts = computed<RolePlayCount[]>(() =>
    computeRolePlayCounts(rawData.value ?? []),
  )

  const winStreak = computed(() => {
    let streak = 0
    for (const game of gameHistory.value) {
      if (game.won) streak++
      else break
    }
    return streak
  })

  return { stats, gameHistory, rolePlayCounts, winStreak, status }
}
