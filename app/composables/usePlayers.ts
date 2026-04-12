import type { Profile, PlayerWithStats, LeaderboardRow } from '~/types'
import { PROFILE_SELECT } from '~/utils/queries'
import { mapLeaderboardRow } from '~/utils/stats'

export function usePlayers() {
  const client = useSupabaseClient()
  const players = useState<Profile[] | null>('players', () => null)

  async function initPlayers() {
    if (players.value) return

    const { data, error } = await client
      .from('profiles')
      .select(PROFILE_SELECT)
      .order('nickname')

    if (error) throw error
    players.value = data as Profile[]
  }

  async function refreshPlayers() {
    const { data, error } = await client
      .from('profiles')
      .select(PROFILE_SELECT)
      .order('nickname')

    if (error) throw error
    players.value = data as Profile[]
  }

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
    return data as string
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
  const client = useSupabaseClient()

  const { data: players, status } = useAsyncData(
    'players-with-stats',
    async () => {
      const { data, error } = await client.rpc(
        'get_player_leaderboard',
      )

      if (error) throw error
      return (data as LeaderboardRow[]).map(mapLeaderboardRow)
    },
  )

  return { players, status }
}
