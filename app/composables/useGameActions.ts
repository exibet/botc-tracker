import type { Game, GameWithDetails } from '~/types'
import { API } from '#shared/api'

export function useGameActions() {
  const client = useSupabaseClient()
  const { profile } = useAuth()
  const { refreshStats } = useGameStats()

  async function getById(id: string) {
    return $fetch<GameWithDetails>(API.GAME(id))
  }

  // Mutations stay client-side until Phase 4
  async function create(game: {
    date: string
    script: string
    custom_script_name?: string | null
    storyteller_id?: string | null
    notes?: string | null
    player_count?: number | null
  }) {
    if (!profile.value) throw new Error('Профіль не завантажено')

    const { data, error } = await client
      .from('games')
      .insert({
        ...game,
        status: 'upcoming',
        created_by: profile.value.id,
      })
      .select()
      .single()

    if (error) throw error
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
    refreshStats()
    return data as Game
  }

  async function remove(id: string) {
    const { error } = await client
      .from('games')
      .delete()
      .eq('id', id)

    if (error) throw error
    refreshStats()
  }

  return {
    getById,
    create,
    update,
    remove,
  }
}
