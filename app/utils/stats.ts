/**
 * Shared stats aggregation for game_players rows.
 * Used by useHome, usePlayers, and useLeaderboard.
 */

export interface GamePlayerStatsRow {
  player_id: string
  is_mvp: boolean
  alignment_start: string | null
  alignment_end: string | null
  game: { winner: string }
}

export interface AggregatedPlayerStats {
  games: number
  wins: number
  mvps: number
  good: number
  evil: number
}

export function aggregatePlayerStats(
  rows: GamePlayerStatsRow[],
): Map<string, AggregatedPlayerStats> {
  const statsMap = new Map<string, AggregatedPlayerStats>()

  for (const row of rows) {
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
