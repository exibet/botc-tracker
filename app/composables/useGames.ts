import type { Game, GameWithDetails } from '~/types'
import { GAME_SELECT } from '~/utils/queries'

export function useGames() {
  const client = useSupabaseClient()
  const { profile } = useAuth()

  const { data: games, status, refresh } = useAsyncData('games', async () => {
    const { data, error } = await client
      .from('games')
      .select(GAME_SELECT)
      .order('date', { ascending: false })

    if (error) throw error
    return data as GameWithDetails[]
  })

  async function getById(id: string) {
    const { data, error } = await client
      .from('games')
      .select(GAME_SELECT)
      .eq('id', id)
      .single()

    if (error) throw error
    return data as GameWithDetails
  }

  async function create(game: {
    date: string
    script: string
    custom_script_name?: string | null
    storyteller_id?: string | null
    notes?: string | null
    player_count?: number | null
  }) {
    const { data, error } = await client
      .from('games')
      .insert({
        ...game,
        status: 'upcoming',
        created_by: profile.value!.id,
      })
      .select()
      .single()

    if (error) throw error
    await refresh()
    return data as Game
  }

  async function update(id: string, updates: Partial<{
    date: string
    script: string
    custom_script_name: string | null
    status: string
    winner: string | null
    storyteller_id: string | null
    notes: string | null
    player_count: number | null
  }>) {
    const { data, error } = await client
      .from('games')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    await refresh()
    return data as Game
  }

  async function remove(id: string) {
    const { error } = await client
      .from('games')
      .delete()
      .eq('id', id)

    if (error) throw error
    await refresh()
  }

  return {
    games,
    status,
    refresh,
    getById,
    create,
    update,
    remove,
  }
}
