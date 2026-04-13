import type { GameWithDetails } from '~/types'
import { API } from '#shared/api'
import { FETCH_KEY } from '#shared/fetch-keys'
import { mapLeaderboardRow } from '~/utils/stats'
import type { LeaderboardRpcRow } from '~/utils/stats'

interface HomeResponse {
  inProgressGames: GameWithDetails[]
  upcomingGames: GameWithDetails[]
  recentGames: GameWithDetails[]
  topPlayers: LeaderboardRpcRow[]
}

export function useHome() {
  const { data, status, refresh } = useAsyncData(
    FETCH_KEY.HOME,
    async () => {
      const raw = await $fetch<HomeResponse>(API.HOME)
      return {
        ...raw,
        topPlayers: raw.topPlayers.map(mapLeaderboardRow),
      }
    },
  )

  return { data, status, refresh }
}
