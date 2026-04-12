import type { GameWithDetails } from '~/types'
import { GAME_LIST_SELECT } from '~/utils/queries'

export function useGames() {
  const client = useSupabaseClient()

  const { data: games, status, refresh } = useAsyncData('games', async () => {
    const { data, error } = await client
      .from('games')
      .select(GAME_LIST_SELECT)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as GameWithDetails[]
  })

  return {
    games,
    status,
    refresh,
  }
}
