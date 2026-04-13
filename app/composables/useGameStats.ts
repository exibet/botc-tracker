import { API } from '#shared/api'

export interface GameStats {
  totalGames: number
  goodWins: number
  evilWins: number
  totalPlayers: number
}

export function useGameStats() {
  const stats = useState<GameStats | null>('game-stats', () => null)

  async function initStats() {
    if (stats.value) return
    await refreshStats()
  }

  async function refreshStats() {
    stats.value = await $fetch<GameStats>(API.STATS)
  }

  const goodPct = computed(() => {
    if (!stats.value?.totalGames) return 0
    return Math.round(
      (stats.value.goodWins / stats.value.totalGames) * 100,
    )
  })

  const evilPct = computed(() => {
    if (!stats.value?.totalGames) return 0
    return 100 - goodPct.value
  })

  return {
    stats,
    initStats,
    refreshStats,
    goodPct,
    evilPct,
  }
}
