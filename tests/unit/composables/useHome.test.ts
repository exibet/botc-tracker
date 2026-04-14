import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

const { mockFetch } = vi.hoisted(() => ({ mockFetch: vi.fn() }))
vi.stubGlobal('$fetch', mockFetch)

mockNuxtImport('useAsyncData', () => (_key: string, fetcher: () => Promise<unknown>) => {
  const data = ref<unknown>(null)
  const status = ref('pending')
  fetcher().then((d) => {
    data.value = d
    status.value = 'success'
  })
  return { data, status, refresh: vi.fn() }
})

describe('useHome', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches home data and maps topPlayers via mapLeaderboardRow', async () => {
    mockFetch.mockResolvedValue({
      inProgressGames: [{ id: 'g1' }],
      upcomingGames: [{ id: 'g2' }],
      recentGames: [{ id: 'g3' }],
      topPlayers: [{
        id: 'p1',
        nickname: 'Alice',
        avatar_url: null,
        role: 'player',
        is_manual: false,
        created_at: '2026-01-01',
        games_played: 10,
        wins: 6,
        mvp_count: 1,
        good_games: 5,
        evil_games: 5,
        points: 7,
        win_streak: 2,
      }],
    })

    const { data, status } = useHome()
    await vi.waitFor(() => expect(status.value).toBe('success'))

    const result = data.value as { topPlayers: { winRate: number }[], inProgressGames: unknown[] }
    expect(result.inProgressGames).toEqual([{ id: 'g1' }])
    expect(result.topPlayers[0]!.winRate).toBe(60)
  })

  it('exposes refresh function', () => {
    const { refresh } = useHome()
    expect(typeof refresh).toBe('function')
  })
})
