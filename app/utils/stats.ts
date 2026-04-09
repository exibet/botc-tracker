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
  game: { winner: string }
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
function winPoints(roleType: string | null): number {
  if (roleType === 'demon') return 2
  if (roleType === 'minion') return 1.5
  return 1
}

export function aggregatePlayerStats(
  rows: GamePlayerStatsRow[],
): Map<string, AggregatedPlayerStats> {
  const statsMap = new Map<string, AggregatedPlayerStats>()

  for (const row of rows) {
    const entry = statsMap.get(row.player_id)
      ?? {
        games: 0, wins: 0, mvps: 0,
        good: 0, evil: 0, points: 0,
      }
    entry.games++
    if (row.is_mvp) entry.mvps++
    const alignment
      = row.alignment_end ?? row.alignment_start
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
