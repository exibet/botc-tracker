import type { Profile } from '#shared/types'
import { API } from '#shared/api'
import { FETCH_KEY } from '#shared/fetch-keys'
import { mapLeaderboardRow } from '~/utils/stats'
import type { LeaderboardRpcRow } from '~/utils/stats'

export function usePlayers() {
  const players = useState<Profile[] | null>('players', () => null)
  const playersLoading = useState('players-loading', () => false)

  async function initPlayers() {
    if (players.value) return
    await refreshPlayers()
  }

  async function refreshPlayers() {
    playersLoading.value = true
    try {
      players.value = await $fetch<Profile[]>(API.PLAYERS_LIST)
    }
    finally {
      playersLoading.value = false
    }
  }

  async function createManual(nickname: string) {
    return $api<{ id: string }>(API.PLAYER_MANUAL, {
      method: 'POST',
      body: { nickname },
    })
  }

  async function linkProfile(
    manualId: string,
    authId: string,
  ) {
    await $fetch(API.PLAYER_LINK, {
      method: 'POST',
      body: { manual_id: manualId, auth_id: authId },
    })
  }

  async function unlinkProfile(
    authId: string,
    nickname: string,
  ) {
    const { manualId } = await $fetch<{ manualId: string }>(
      API.PLAYER_UNLINK,
      { method: 'POST', body: { auth_id: authId, nickname } },
    )
    return manualId
  }

  return {
    players,
    playersLoading,
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
