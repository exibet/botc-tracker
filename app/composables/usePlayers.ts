import type { Profile } from '~/types'
import { API } from '#shared/api'
import { FETCH_KEY } from '#shared/fetch-keys'
import { mapLeaderboardRow } from '~/utils/stats'
import type { LeaderboardRpcRow } from '~/utils/stats'

export function usePlayers() {
  const client = useSupabaseClient()
  const players = useState<Profile[] | null>('players', () => null)

  async function initPlayers() {
    if (players.value) return
    await refreshPlayers()
  }

  async function refreshPlayers() {
    players.value = await $fetch<Profile[]>(API.PLAYERS_LIST)
  }

  // Mutations stay client-side until Phase 6
  async function createManual(nickname: string) {
    const { data, error } = await client
      .from('profiles')
      .insert({
        nickname,
        is_manual: true,
      })
      .select('id')
      .single()

    if (error) throw error
    await refreshPlayers()
    return data
  }

  async function linkProfile(
    manualId: string,
    authId: string,
  ) {
    const { error } = await client.rpc('link_manual_profile', {
      manual_id: manualId,
      auth_id: authId,
    })
    if (error) throw error
    await refreshPlayers()
  }

  async function unlinkProfile(
    authId: string,
    nickname: string,
  ) {
    const { data, error } = await client.rpc('unlink_profile', {
      auth_id: authId,
      manual_nickname: nickname,
    })
    if (error) throw error
    await refreshPlayers()
    return data as unknown as string
  }

  return {
    players,
    initPlayers,
    refreshPlayers,
    createManual,
    linkProfile,
    unlinkProfile,
  }
}

export function usePlayersWithStats() {
  const { data: players, status } = useAsyncData(
    FETCH_KEY.PLAYERS_LEADERBOARD,
    async () => {
      const rows = await $fetch(API.PLAYERS)
      return (rows as LeaderboardRpcRow[]).map(mapLeaderboardRow)
    },
  )

  return { players, status }
}
