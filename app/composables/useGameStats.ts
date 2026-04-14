import { API } from '#shared/api'
import { FETCH_KEY } from '#shared/fetch-keys'

export interface GameStats {
  totalGames: number
  goodWins: number
  evilWins: number
  totalPlayers: number
}

export function useGameStats() {
  const { data: stats } = useAsyncData(
    FETCH_KEY.STATS,
    () => $fetch<GameStats>(API.STATS),
  )

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
    goodPct,
    evilPct,
  }
}
