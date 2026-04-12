export interface GameStats {
  totalGames: number
  goodWins: number
  evilWins: number
  totalPlayers: number
}

export function useGameStats() {
  const client = useSupabaseClient()
  const stats = useState<GameStats | null>('game-stats', () => null)

  async function initStats() {
    if (stats.value) return
    await refreshStats()
  }

  async function refreshStats() {
    const { data, error } = await client.rpc('get_home_stats')
    if (error) {
      console.error('Failed to load game stats:', error.message)
      return
    }
    stats.value = data as GameStats
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
