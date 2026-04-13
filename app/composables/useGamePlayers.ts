import type { GamePlayerInline, GameWithDetails, MvpVote, Role } from '#shared/types'
import { API } from '#shared/api'

interface RoleRef {
  id: string
  name_ua: string
  name_en: string
  image_url: string | null
  type: string
}

export interface GamePlayerWithDetails {
  id: string
  game_id: string
  player_id: string
  starting_role_id: string | null
  ending_role_id: string | null
  alignment_start: string | null
  alignment_end: string | null
  is_alive: boolean | null
  is_mvp: boolean
  added_by: string
  created_at: string
  player: { id: string, nickname: string, avatar_url: string | null }
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
  const { roles } = useRoles()
  const id = toRef(gameId)

  const rolesMap = computed(() => {
    const map = new Map<string, Role>()
    if (roles.value) {
      for (const r of roles.value) map.set(r.id, r)
    }
    return map
  })

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
    const game = await $fetch<GameWithDetails>(API.GAME(id.value))
    if (game.game_players) {
      setFromInline(game.game_players as GamePlayerInline[])
    }
    status.value = 'success'
  }

  if (!initialData) {
    fetchPlayers()
  }

  async function refresh() {
    await fetchPlayers()
  }

  function setFromInline(data: GamePlayerInline[]) {
    players.value = data.map(e => resolveRoles(e, rolesMap.value))
  }

  async function refreshFromGame(): Promise<{
    game: GameWithDetails
    votes: MvpVote[]
  } | null> {
    try {
      const game = await $fetch<GameWithDetails>(API.GAME(id.value))
      if (game.game_players) {
        setFromInline(game.game_players as GamePlayerInline[])
      }
      return { game, votes: game.mvp_votes ?? [] }
    }
    catch {
      return null
    }
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
    const record = await $api<GamePlayerWithDetails>(
      API.GAME_PLAYERS,
      { method: 'POST', body: { ...entry, game_id: id.value } },
    )
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
    const record = await $api<GamePlayerWithDetails>(
      API.GAME_PLAYER(entryId),
      { method: 'PUT', body: updates },
    )
    if (players.value) {
      players.value = players.value.map(p =>
        p.id === entryId ? record : p,
      )
    }
  }

  async function remove(entryId: string) {
    await $api(API.GAME_PLAYER(entryId), { method: 'DELETE' })
    if (players.value) {
      players.value = players.value.filter(p => p.id !== entryId)
    }
  }

  return {
    players,
    status,
    refresh,
    setFromInline,
    refreshFromGame,
    add,
    update,
    remove,
  }
}
