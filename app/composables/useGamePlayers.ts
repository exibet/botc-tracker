import type { GamePlayer, GamePlayerInline, Role } from '~/types'

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

function roleToRef(role: Role | undefined): RoleRef | null {
  if (!role) return null
  return {
    id: role.id,
    name_ua: role.name_ua,
    name_en: role.name_en,
    image_url: role.image_url,
    type: role.type,
  }
}

function resolveRoles(
  entry: GamePlayerInline,
  rolesMap: Map<string, Role>,
): GamePlayerWithDetails {
  return {
    ...entry,
    starting_role: entry.starting_role_id
      ? roleToRef(rolesMap.get(entry.starting_role_id))
      : null,
    ending_role: entry.ending_role_id
      ? roleToRef(rolesMap.get(entry.ending_role_id))
      : null,
  }
}

export function useGamePlayers(
  gameId: Ref<string> | string,
  initialData?: GamePlayerInline[] | null,
) {
  const client = useSupabaseClient()
  const { roles } = useRoles()
  const id = toRef(gameId)

  const rolesMap = computed(() => {
    const map = new Map<string, Role>()
    if (roles.value) {
      for (const r of roles.value) map.set(r.id, r)
    }
    return map
  })

  const SELECT_WITH_DETAILS = `
    *,
    player:profiles!player_id(id, nickname, avatar_url),
    starting_role:roles!starting_role_id(id, name_ua, name_en, image_url, type),
    ending_role:roles!ending_role_id(id, name_ua, name_en, image_url, type)
  `

  const players = ref<GamePlayerWithDetails[] | null>(
    initialData
      ? initialData.map(e => resolveRoles(e, rolesMap.value))
      : null,
  )
  const status = ref<'idle' | 'pending' | 'success' | 'error'>(
    initialData ? 'success' : 'idle',
  )

  async function fetchPlayers() {
    if (!id.value) {
      players.value = []
      status.value = 'success'
      return
    }
    status.value = 'pending'
    const { data, error } = await client
      .from('game_players')
      .select(SELECT_WITH_DETAILS)
      .eq('game_id', id.value)

    if (error) {
      status.value = 'error'
      throw error
    }
    players.value = data as GamePlayerWithDetails[]
    status.value = 'success'
  }

  // Only fetch if no initial data was provided
  if (!initialData) {
    fetchPlayers()
  }

  async function refresh() {
    await fetchPlayers()
  }

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

  return {
    players,
    status,
    refresh,
    add,
    update,
    remove,
  }
}
