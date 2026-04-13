import type {
  Alignment,
  PlayerGameHistory,
  PlayerStats,
  Profile,
  RolePlayCount,
  RoleType,
  Script,
  Winner,
} from '#shared/types'
import { API } from '#shared/api'
import { FETCH_KEY } from '#shared/fetch-keys'
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
  role: {
    name_ua: string
    name_en: string
    type: string
    image_url: string | null
  },
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

function computeRolePlayCounts(
  rows: GamePlayerRow[],
): RolePlayCount[] {
  const counts = new Map<string, RolePlayCount>()

  for (const row of rows) {
    if (row.starting_role) {
      incrementRole(counts, row.starting_role)
    }
    if (
      row.ending_role
      && row.starting_role
      && row.ending_role.name_en !== row.starting_role.name_en
    ) {
      incrementRole(counts, row.ending_role)
    }
    if (row.ending_role && !row.starting_role) {
      incrementRole(counts, row.ending_role)
    }
  }

  return Array.from(counts.values())
    .sort((a, b) => b.count - a.count)
}

function toGameHistory(
  rows: GamePlayerRow[],
): PlayerGameHistory[] {
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
        startingRoleType:
          (row.starting_role?.type ?? null) as RoleType | null,
        endingRoleName: row.ending_role?.name_ua ?? null,
        endingRoleNameEn: row.ending_role?.name_en ?? null,
        endingRoleImageUrl: row.ending_role?.image_url ?? null,
        endingRoleType:
          (row.ending_role?.type ?? null) as RoleType | null,
        alignmentStart: row.alignment_start,
        alignmentEnd: row.alignment_end,
        hasRoleChange,
        hasAlignmentChange,
      }
    })
}

export function usePlayerStats(playerId: Ref<string> | string) {
  const id = toRef(playerId)

  const { data, status } = useFetch(
    () => API.PLAYER(id.value),
    { key: FETCH_KEY.PLAYER(id.value) },
  )

  const player = computed(
    () => (data.value as { profile: Profile } | null)?.profile ?? null,
  )

  const rawGames = computed<GamePlayerRow[]>(
    () => (data.value as { games: GamePlayerRow[] } | null)
      ?.games ?? [],
  )

  const stats = computed<PlayerStats>(() =>
    computeSinglePlayerStats(
      rawGames.value.map(r => ({
        ...r,
        player_id: id.value,
      })),
    ),
  )

  const gameHistory = computed<PlayerGameHistory[]>(() =>
    toGameHistory(rawGames.value),
  )

  const rolePlayCounts = computed<RolePlayCount[]>(() =>
    computeRolePlayCounts(rawGames.value),
  )

  const winStreak = computed(() => {
    let streak = 0
    for (const game of gameHistory.value) {
      if (game.won) streak++
      else break
    }
    return streak
  })

  return { player, stats, gameHistory, rolePlayCounts, winStreak, status }
}
