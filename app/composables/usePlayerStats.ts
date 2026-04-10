import type {
  Alignment,
  PlayerGameHistory,
  PlayerStats,
  RolePlayCount,
  RoleType,
  Script,
  Winner,
} from '~/types'
import { winPoints } from '~/utils/stats'

interface GamePlayerRow {
  game_id: string
  alignment_start: Alignment | null
  alignment_end: Alignment | null
  is_alive: boolean
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
  }
}

function computeStats(allRows: GamePlayerRow[]): PlayerStats {
  const rows = allRows.filter(
    r => r.game.status === 'finished' && r.game.winner,
  )
  const total = rows.length
  if (total === 0) {
    return {
      totalGames: 0,
      wins: 0,
      losses: 0,
      winRate: 0,
      mvpCount: 0,
      survivalRate: 0,
      goodGames: 0,
      goodWins: 0,
      goodWinRate: 0,
      evilGames: 0,
      evilWins: 0,
      evilWinRate: 0,
      points: 0,
      roleDistribution: {
        townsfolk: 0,
        outsider: 0,
        minion: 0,
        demon: 0,
        traveller: 0,
        fabled: 0,
      },
    }
  }

  let wins = 0
  let points = 0
  let mvpCount = 0
  let aliveCount = 0
  let goodGames = 0
  let goodWins = 0
  let evilGames = 0
  let evilWins = 0
  const roleDist: Record<RoleType, number> = {
    townsfolk: 0,
    outsider: 0,
    minion: 0,
    demon: 0,
    traveller: 0,
    fabled: 0,
  }

  for (const row of rows) {
    const alignment = row.alignment_end ?? row.alignment_start
    const won = didWin(alignment, row.game.winner)

    if (won) {
      wins++
      points += winPoints(
        row.ending_role?.type ?? row.starting_role?.type ?? null,
      )
    }
    if (row.is_mvp) mvpCount++
    if (row.is_alive) aliveCount++

    if (alignment === 'good') {
      goodGames++
      if (won) goodWins++
    }
    else if (alignment === 'evil') {
      evilGames++
      if (won) evilWins++
    }

    const roleType = (
      row.ending_role?.type
      ?? row.starting_role?.type
    ) as RoleType | undefined
    if (roleType && roleType in roleDist) {
      roleDist[roleType]++
    }
  }

  return {
    totalGames: total,
    wins,
    losses: total - wins,
    winRate: Math.round((wins / total) * 100),
    mvpCount,
    survivalRate: Math.round((aliveCount / total) * 100),
    goodGames,
    goodWins,
    goodWinRate: goodGames > 0
      ? Math.round((goodWins / goodGames) * 100)
      : 0,
    evilGames,
    evilWins,
    evilWinRate: evilGames > 0
      ? Math.round((evilWins / evilGames) * 100)
      : 0,
    points,
    roleDistribution: roleDist,
  }
}

function didWin(
  alignment: Alignment | null,
  winner: Winner | null,
): boolean {
  if (!alignment || !winner) return false
  return alignment === winner
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
  return rows.filter(r => r.game.status === 'finished')
    .map((row) => {
      const role = row.ending_role ?? row.starting_role
      const alignment = row.alignment_end ?? row.alignment_start

      const hasRoleChange = !!(
        row.starting_role
        && row.ending_role
        && row.ending_role.name_en !== row.starting_role.name_en
      )

      const hasAlignmentChange = !!(
        row.alignment_end
        && row.alignment_end !== row.alignment_start
      )

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
        won: didWin(alignment, row.game.winner),
        // Starting role data
        startingRoleName: row.starting_role?.name_ua ?? null,
        startingRoleNameEn: row.starting_role?.name_en ?? null,
        startingRoleImageUrl: row.starting_role?.image_url ?? null,
        startingRoleType: (row.starting_role?.type ?? null) as RoleType | null,
        // Ending role data
        endingRoleName: row.ending_role?.name_ua ?? null,
        endingRoleNameEn: row.ending_role?.name_en ?? null,
        endingRoleImageUrl: row.ending_role?.image_url ?? null,
        endingRoleType: (row.ending_role?.type ?? null) as RoleType | null,
        // Alignment timeline
        alignmentStart: row.alignment_start,
        alignmentEnd: row.alignment_end,
        // Flags
        hasRoleChange,
        hasAlignmentChange,
      }
    })
    .sort((a, b) => b.date.localeCompare(a.date))
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
    id, date, script, status, winner
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
      return data as unknown as GamePlayerRow[]
    },
  )

  const stats = computed<PlayerStats>(() =>
    computeStats(rawData.value ?? []),
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
