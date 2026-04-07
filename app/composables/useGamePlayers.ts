import type { GamePlayer, PlayerEntry } from '~/types'

interface RoleRef {
  id: string
  name_ua: string
  name_en: string
  image_url: string | null
  type: string
}

export interface GamePlayerWithDetails extends GamePlayer {
  player: {
    id: string
    nickname: string
    avatar_url: string | null
  }
  starting_role: RoleRef | null
  ending_role: RoleRef | null
}

export function useGamePlayers(gameId: Ref<string> | string) {
  const client = useSupabaseClient()
  const id = toRef(gameId)

  const SELECT_WITH_DETAILS = `
    *,
    player:profiles!player_id(id, nickname, avatar_url),
    starting_role:roles!starting_role_id(id, name_ua, name_en, image_url, type),
    ending_role:roles!ending_role_id(id, name_ua, name_en, image_url, type)
  `

  const { data: players, status, refresh } = useAsyncData(
    `game-players-${id.value}`,
    async () => {
      const { data, error } = await client
        .from('game_players')
        .select(SELECT_WITH_DETAILS)
        .eq('game_id', id.value)

      if (error) throw error
      return data as GamePlayerWithDetails[]
    },
  )

  async function add(entry: {
    player_id: string
    starting_role_id?: string | null
    ending_role_id?: string | null
    alignment_start?: string | null
    alignment_end?: string | null
    is_alive?: boolean
    is_mvp?: boolean
    added_by: string
  }) {
    const { data, error } = await client
      .from('game_players')
      .insert({ ...entry, game_id: id.value })
      .select(SELECT_WITH_DETAILS)
      .single()

    if (error) throw error
    const record = data as GamePlayerWithDetails
    players.value = [...(players.value ?? []), record]
    return record
  }

  async function update(entryId: string, updates: Partial<{
    starting_role_id: string
    ending_role_id: string | null
    alignment_start: string
    alignment_end: string | null
    is_alive: boolean
    is_mvp: boolean
  }>) {
    const { data, error } = await client
      .from('game_players')
      .update(updates)
      .eq('id', entryId)
      .select(SELECT_WITH_DETAILS)
      .single()

    if (error) throw error

    if (data && players.value) {
      players.value = players.value.map(p =>
        p.id === entryId
          ? data as GamePlayerWithDetails
          : p,
      )
    }
  }

  async function remove(entryId: string) {
    const { error } = await client
      .from('game_players')
      .delete()
      .eq('id', entryId)

    if (error) throw error
    if (players.value) {
      players.value = players.value.filter(
        p => p.id !== entryId,
      )
    }
  }

  async function syncFromEntries(
    entries: PlayerEntry[],
    addedBy: string,
  ) {
    // Delete all existing players for this game
    const { error: deleteError } = await client
      .from('game_players')
      .delete()
      .eq('game_id', id.value)
    if (deleteError) throw deleteError

    // Insert all entries
    if (entries.length) {
      const rows = entries.map(e => ({
        game_id: id.value,
        player_id: e.player_id,
        starting_role_id: e.starting_role_id,
        ending_role_id: e.ending_role_id,
        alignment_start: e.alignment_start,
        alignment_end: e.alignment_end,
        is_alive: e.is_alive,
        is_mvp: e.is_mvp,
        added_by: addedBy,
      }))
      const { error: insertError } = await client
        .from('game_players')
        .insert(rows)
      if (insertError) throw insertError
    }

    await refresh()
  }

  return {
    players,
    status,
    refresh,
    add,
    update,
    remove,
    syncFromEntries,
  }
}
