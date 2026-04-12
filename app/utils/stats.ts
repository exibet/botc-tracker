import type { PlayerStats, RoleType } from '~/types'
import type { Database } from '~/types/database.types'
import { effectiveAlignment } from '~/utils/display'

/**
 * Shared stats aggregation for game_players rows.
 * Used by useHome, usePlayers, useLeaderboard, and usePlayerStats.
 */

export interface GamePlayerStatsRow {
  player_id: string
  is_mvp: boolean
  is_alive?: boolean | null
  alignment_start: string | null
  alignment_end: string | null
  starting_role: { type: string } | null
  ending_role: { type: string } | null
  game: {
    date?: string
    winner: string | null
    status?: string
    created_at?: string
  }
}

function isFinishedGame(row: GamePlayerStatsRow): boolean {
  return row.game.winner != null
    && (!row.game.status || row.game.status === 'finished')
}

export function computeSinglePlayerStats(
  rows: GamePlayerStatsRow[],
): PlayerStats {
  const finished = rows.filter(isFinishedGame)
  const total = finished.length

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

  for (const row of finished) {
    const alignment = effectiveAlignment(
      row.alignment_end, row.alignment_start,
    )
    const won = alignment === row.game.winner

    if (won) {
      wins++
      points += winPoints(
        row.ending_role?.type ?? row.starting_role?.type ?? null,
      )
    }
    if (row.is_mvp) mvpCount++
    if (row.is_alive === true) aliveCount++

    if (alignment === 'good') {
      goodGames++
      if (won) goodWins++
    }
    else if (alignment === 'evil') {
      evilGames++
      if (won) evilWins++
    }

    const roleType = (
      row.ending_role?.type ?? row.starting_role?.type
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

export interface AggregatedPlayerStats {
  games: number
  wins: number
  mvps: number
  good: number
  evil: number
  points: number
}

/**
 * Points per win by role type:
 * townsfolk/outsider = 1, minion = 1.5, demon = 2
 */
export function winPoints(roleType: string | null): number {
  if (roleType === 'demon') return 2
  if (roleType === 'minion') return 1.5
  return 1
}

export function gamePoints(
  won: boolean | null,
  endingRoleType: string | null,
  startingRoleType: string | null,
): number {
  if (!won) return 0
  return winPoints(endingRoleType ?? startingRoleType)
}

export function aggregatePlayerStats(
  rows: GamePlayerStatsRow[],
): Map<string, AggregatedPlayerStats> {
  const statsMap = new Map<string, AggregatedPlayerStats>()

  for (const row of rows) {
    if (!isFinishedGame(row)) continue

    const entry = statsMap.get(row.player_id)
      ?? {
        games: 0, wins: 0, mvps: 0,
        good: 0, evil: 0, points: 0,
      }
    entry.games++
    if (row.is_mvp) entry.mvps++
    const alignment = effectiveAlignment(
      row.alignment_end, row.alignment_start,
    )
    const won = alignment === row.game.winner
    if (won) {
      entry.wins++
      entry.points += winPoints(
        row.ending_role?.type ?? row.starting_role?.type ?? null,
      )
    }
    if (alignment === 'good') entry.good++
    else if (alignment === 'evil') entry.evil++
    statsMap.set(row.player_id, entry)
  }

  return statsMap
}

export function computeWinStreaks(
  rows: GamePlayerStatsRow[],
): Map<string, number> {
  const grouped = new Map<string, GamePlayerStatsRow[]>()
  for (const row of rows) {
    if (!isFinishedGame(row)) continue
    const list = grouped.get(row.player_id) ?? []
    list.push(row)
    grouped.set(row.player_id, list)
  }

  const streaks = new Map<string, number>()
  for (const [playerId, games] of grouped) {
    games.sort((a, b) =>
      (b.game.date ?? '').localeCompare(a.game.date ?? '')
      || (b.game.created_at ?? '').localeCompare(
        a.game.created_at ?? '',
      ),
    )
    let streak = 0
    for (const g of games) {
      const alignment = effectiveAlignment(
        g.alignment_end, g.alignment_start,
      )
      if (alignment === g.game.winner) streak++
      else break
    }
    streaks.set(playerId, streak)
  }
  return streaks
}

type LeaderboardRpcRow = Database['public']['Functions']['get_player_leaderboard']['Returns'][number]

export function mapLeaderboardRow(
  row: LeaderboardRpcRow,
): import('~/types').PlayerWithStats {
  const games = Number(row.games_played)
  const wins = Number(row.wins)
  return {
    id: row.id,
    nickname: row.nickname,
    avatar_url: row.avatar_url,
    role: row.role,
    is_manual: row.is_manual ?? false,
    created_at: row.created_at ?? '',
    gamesPlayed: games,
    wins,
    losses: games - wins,
    winRate: games > 0 ? Math.round((wins / games) * 100) : 0,
    mvpCount: Number(row.mvp_count),
    goodGames: Number(row.good_games),
    evilGames: Number(row.evil_games),
    points: Number(row.points),
    winStreak: Number(row.win_streak),
  }
}

export function podiumRank(
  index: number,
  minPlayers = 3,
  totalPlayers = Infinity,
): 'gold' | 'silver' | 'bronze' | null {
  if (totalPlayers < minPlayers) return null
  if (index === 0) return 'gold'
  if (index === 1) return 'silver'
  if (index === 2) return 'bronze'
  return null
}
