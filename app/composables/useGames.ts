import type { GameWithDetails } from '#shared/types'
import { API } from '#shared/api'
import { FETCH_KEY } from '#shared/fetch-keys'

export function useGames() {
  const { data: games, status, refresh } = useAsyncData(
    FETCH_KEY.GAMES,
    () => $fetch<GameWithDetails[]>(API.GAMES),
  )

  return {
    games,
    status,
    refresh,
  }
}
