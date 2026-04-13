import type { Game, GameWithDetails } from '#shared/types'
import { API } from '#shared/api'

export function useGameActions() {
  const { refreshStats } = useGameStats()

  async function getById(id: string) {
    return $fetch<GameWithDetails>(API.GAME(id))
  }

  async function create(game: {
    date: string
    script: string
    custom_script_name?: string | null
    storyteller_id?: string | null
    notes?: string | null
    player_count?: number | null
  }) {
    return $api<Game>(API.GAMES, { method: 'POST', body: game })
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
    const data = await $api<Game>(API.GAME(id), {
      method: 'PUT',
      body: updates,
    })
    refreshStats()
    return data
  }

  async function remove(id: string) {
    await $api(API.GAME(id), { method: 'DELETE' })
    refreshStats()
  }

  return {
    getById,
    create,
    update,
    remove,
  }
}
