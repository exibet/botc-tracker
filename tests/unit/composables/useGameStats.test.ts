import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockStats = {
  totalGames: 10,
  goodWins: 6,
  evilWins: 4,
  totalPlayers: 12,
}

describe('useGameStats', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useState('game-stats').value = mockStats
  })

  it('returns stats from useState', () => {
    const { stats } = useGameStats()
    expect(stats.value).toEqual(mockStats)
  })

  it('exports initStats and refreshStats', () => {
    const result = useGameStats()
    expect(result).toHaveProperty('initStats')
    expect(result).toHaveProperty('refreshStats')
  })

  it('computes goodPct correctly', () => {
    const { goodPct } = useGameStats()
    expect(goodPct.value).toBe(60)
  })

  it('computes evilPct correctly', () => {
    const { evilPct } = useGameStats()
    expect(evilPct.value).toBe(40)
  })

  it('handles zero games', () => {
    useState('game-stats').value = {
      totalGames: 0, goodWins: 0, evilWins: 0, totalPlayers: 0,
    }
    const { goodPct, evilPct } = useGameStats()
    expect(goodPct.value).toBe(0)
    expect(evilPct.value).toBe(0)
  })
})
