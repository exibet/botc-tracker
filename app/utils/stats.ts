import { effectiveAlignment } from '~/utils/display'

/**
 * Shared stats aggregation for game_players rows.
 * Used by useHome, usePlayers, and useLeaderboard.
 */

export interface GamePlayerStatsRow {
  player_id: string
  is_mvp: boolean
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
