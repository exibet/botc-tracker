import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

const { mockFetch, mockApi } = vi.hoisted(() => ({
  mockFetch: vi.fn(),
  mockApi: vi.fn(),
}))

vi.stubGlobal('$fetch', mockFetch)
vi.stubGlobal('$api', mockApi)
mockNuxtImport('$api', () => mockApi)

const stateStore = new Map<string, ReturnType<typeof ref>>()
mockNuxtImport('useState', () => (key: string, init?: () => unknown) => {
  if (!stateStore.has(key)) stateStore.set(key, ref(init?.()))
  return stateStore.get(key)!
})

mockNuxtImport('useAsyncData', () => (_key: string, fetcher: () => Promise<unknown>) => {
  const data = ref<unknown>(null)
  const status = ref('pending')
  fetcher().then((d) => {
    data.value = d
    status.value = 'success'
  })
  return { data, status }
})

const mockProfiles = [
  { id: 'p1', nickname: 'Alice', role: 'player' },
  { id: 'p2', nickname: 'Bob', role: 'admin' },
]

describe('usePlayers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    stateStore.clear()
  })

  describe('initPlayers / refreshPlayers', () => {
    it('fetches players list and stores in state', async () => {
      mockFetch.mockResolvedValue(mockProfiles)
      const { players, refreshPlayers } = usePlayers()

      await refreshPlayers()

      expect(players.value).toEqual(mockProfiles)
      expect(mockFetch).toHaveBeenCalledWith('/api/players/list')
    })

    it('initPlayers skips fetch when already loaded', async () => {
      mockFetch.mockResolvedValue(mockProfiles)
      const { initPlayers, refreshPlayers } = usePlayers()
      await refreshPlayers()
      vi.clearAllMocks()

      await initPlayers()
      expect(mockFetch).not.toHaveBeenCalled()
    })
  })

  describe('createManual', () => {
    it('creates manual profile via $api', async () => {
      mockApi.mockResolvedValue({ id: 'new-id' })

      const { createManual } = usePlayers()
      const result = await createManual('Charlie')

      expect(result).toEqual({ id: 'new-id' })
      expect(mockApi).toHaveBeenCalledWith('/api/players/manual', {
        method: 'POST',
        body: { nickname: 'Charlie' },
      })
    })
  })

  describe('linkProfile', () => {
    it('calls link endpoint with manual_id and auth_id', async () => {
      mockFetch.mockResolvedValue({ success: true })

      const { linkProfile } = usePlayers()
      await linkProfile('manual-1', 'auth-1')

      expect(mockFetch).toHaveBeenCalledWith('/api/players/link', {
        method: 'POST',
        body: { manual_id: 'manual-1', auth_id: 'auth-1' },
      })
    })
  })

  describe('unlinkProfile', () => {
    it('returns manualId from response', async () => {
      mockFetch.mockResolvedValue({ manualId: 'new-manual' })

      const { unlinkProfile } = usePlayers()
      const result = await unlinkProfile('auth-1', 'Alice')

      expect(result).toBe('new-manual')
    })
  })
})

describe('usePlayersWithStats', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches and maps leaderboard rows', async () => {
    mockFetch.mockResolvedValue([{
      id: 'p1',
      nickname: 'Alice',
      avatar_url: null,
      role: 'player',
      is_manual: false,
      created_at: '2026-01-01',
      games_played: 10,
      wins: 7,
      mvp_count: 2,
      good_games: 6,
      evil_games: 4,
      points: 8,
      win_streak: 3,
    }])

    const { players, status } = usePlayersWithStats()
    await vi.waitFor(() => expect(status.value).toBe('success'))

    expect((players.value as { id: string, winRate: number }[])[0]).toMatchObject({
      id: 'p1',
      gamesPlayed: 10,
      wins: 7,
      losses: 3,
      winRate: 70,
    })
  })
})
