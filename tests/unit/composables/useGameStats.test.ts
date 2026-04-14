import { describe, expect, it } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

const mockStats = {
  totalGames: 10,
  goodWins: 6,
  evilWins: 4,
  totalPlayers: 12,
}

const statsData = ref(mockStats)

mockNuxtImport('useAsyncData', () => () => {
  return { data: statsData }
})

describe('useGameStats', () => {
  it('returns stats from useAsyncData', () => {
    const { stats } = useGameStats()
    expect(stats.value).toEqual(mockStats)
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
    statsData.value = { totalGames: 0, goodWins: 0, evilWins: 0, totalPlayers: 0 }
    const { goodPct, evilPct } = useGameStats()
    expect(goodPct.value).toBe(0)
    expect(evilPct.value).toBe(0)
    statsData.value = mockStats
  })
})
