import { describe, expect, it } from 'vitest'
import {
  aggregatePlayerStats,
  computeSinglePlayerStats,
  computeWinStreaks,
  gamePoints,
  podiumRank,
  winPoints,
} from '~~/app/utils/stats'

function row(overrides: Record<string, unknown> = {}): never {
  return {
    player_id: 'p1',
    is_mvp: false,
    is_alive: true,
    alignment_start: 'good',
    alignment_end: null,
    starting_role: { type: 'townsfolk' },
    ending_role: null,
    game: { date: '2026-01-01', winner: 'good', status: 'finished', created_at: '2026-01-01T00:00:00Z' },
    ...overrides,
  } as never
}

describe('winPoints', () => {
  it('demon = 2', () => expect(winPoints('demon')).toBe(2))
  it('minion = 1.5', () => expect(winPoints('minion')).toBe(1.5))
  it('townsfolk/outsider/null = 1', () => {
    expect(winPoints('townsfolk')).toBe(1)
    expect(winPoints('outsider')).toBe(1)
    expect(winPoints(null)).toBe(1)
  })
})

describe('gamePoints', () => {
  it('returns 0 when not won', () => {
    expect(gamePoints(false, 'demon', null)).toBe(0)
    expect(gamePoints(null, 'demon', null)).toBe(0)
  })

  it('uses ending role type when present', () => {
    expect(gamePoints(true, 'demon', 'townsfolk')).toBe(2)
  })

  it('falls back to starting role type', () => {
    expect(gamePoints(true, null, 'minion')).toBe(1.5)
  })
})

describe('podiumRank', () => {
  it('returns gold/silver/bronze for indices 0/1/2', () => {
    expect(podiumRank(0)).toBe('gold')
    expect(podiumRank(1)).toBe('silver')
    expect(podiumRank(2)).toBe('bronze')
  })

  it('returns null for index >= 3', () => {
    expect(podiumRank(3)).toBeNull()
  })

  it('returns null when totalPlayers below minPlayers', () => {
    expect(podiumRank(0, 3, 2)).toBeNull()
  })
})

describe('computeSinglePlayerStats', () => {
  it('returns zero stats for empty input', () => {
    const stats = computeSinglePlayerStats([])
    expect(stats.totalGames).toBe(0)
    expect(stats.points).toBe(0)
    expect(stats.winRate).toBe(0)
  })

  it('counts wins and losses correctly', () => {
    const stats = computeSinglePlayerStats([
      row({ alignment_start: 'good', game: { winner: 'good', date: '2026-01-01', status: 'finished' } }),
      row({ alignment_start: 'evil', game: { winner: 'good', date: '2026-01-02', status: 'finished' } }),
    ])
    expect(stats.totalGames).toBe(2)
    expect(stats.wins).toBe(1)
    expect(stats.losses).toBe(1)
    expect(stats.winRate).toBe(50)
  })

  it('counts MVP', () => {
    const stats = computeSinglePlayerStats([row({ is_mvp: true })])
    expect(stats.mvpCount).toBe(1)
  })

  it('skips unfinished games (no winner)', () => {
    const stats = computeSinglePlayerStats([
      row({ game: { winner: null, date: '2026-01-01', status: 'in_progress' } }),
    ])
    expect(stats.totalGames).toBe(0)
  })

  it('aggregates good vs evil', () => {
    const stats = computeSinglePlayerStats([
      row({ alignment_start: 'good', game: { winner: 'good', date: '2026-01-01', status: 'finished' } }),
      row({ alignment_start: 'evil', game: { winner: 'evil', date: '2026-01-02', status: 'finished' } }),
    ])
    expect(stats.goodGames).toBe(1)
    expect(stats.goodWins).toBe(1)
    expect(stats.evilGames).toBe(1)
    expect(stats.evilWins).toBe(1)
  })

  it('uses ending alignment when set', () => {
    const stats = computeSinglePlayerStats([
      row({
        alignment_start: 'good',
        alignment_end: 'evil',
        game: { winner: 'evil', date: '2026-01-01', status: 'finished' },
      }),
    ])
    expect(stats.evilWins).toBe(1)
    expect(stats.goodGames).toBe(0)
  })
})

describe('aggregatePlayerStats', () => {
  it('groups stats by player_id', () => {
    const map = aggregatePlayerStats([
      row({ player_id: 'p1' }),
      row({ player_id: 'p1' }),
      row({ player_id: 'p2' }),
    ])
    expect(map.get('p1')?.games).toBe(2)
    expect(map.get('p2')?.games).toBe(1)
  })

  it('skips unfinished games', () => {
    const map = aggregatePlayerStats([
      row({ player_id: 'p1', game: { winner: null, date: '2026-01-01', status: 'in_progress' } }),
    ])
    expect(map.size).toBe(0)
  })
})

describe('computeWinStreaks', () => {
  it('returns 0 for no wins', () => {
    const streaks = computeWinStreaks([
      row({ player_id: 'p1', alignment_start: 'evil', game: { winner: 'good', date: '2026-01-01', status: 'finished' } }),
    ])
    expect(streaks.get('p1')).toBe(0)
  })

  it('counts consecutive wins from latest', () => {
    const streaks = computeWinStreaks([
      row({ player_id: 'p1', alignment_start: 'good', game: { winner: 'good', date: '2026-01-03', status: 'finished' } }),
      row({ player_id: 'p1', alignment_start: 'good', game: { winner: 'good', date: '2026-01-02', status: 'finished' } }),
      row({ player_id: 'p1', alignment_start: 'evil', game: { winner: 'good', date: '2026-01-01', status: 'finished' } }),
    ])
    expect(streaks.get('p1')).toBe(2)
  })
})
