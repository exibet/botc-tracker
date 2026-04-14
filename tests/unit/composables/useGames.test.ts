import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

const mockGames = [
  {
    id: 'game-1',
    date: '2026-04-01',
    script: 'trouble_brewing',
    winner: 'good',
    player_count: 8,
    storyteller: { id: 'user-1', nickname: 'Storyteller' },
    created_by_profile: { id: 'user-1', nickname: 'Admin' },
  },
  {
    id: 'game-2',
    date: '2026-03-25',
    script: 'bad_moon_rising',
    winner: 'evil',
    player_count: 10,
    storyteller: null,
    created_by_profile: { id: 'user-1', nickname: 'Admin' },
  },
]

const { mockFetch, mockApi } = vi.hoisted(() => ({
  mockFetch: vi.fn(),
  mockApi: vi.fn(),
}))

vi.stubGlobal('$fetch', mockFetch)
vi.stubGlobal('$api', mockApi)
mockNuxtImport('$api', () => mockApi)

mockNuxtImport('useAuth', () => () => ({
  profile: ref({ id: 'user-1', nickname: 'Admin', role: 'admin' }),
  isAuthenticated: computed(() => true),
  isAdmin: computed(() => true),
}))
mockNuxtImport('useGameStats', () => () => ({
  refreshStats: vi.fn(),
}))

const mockPaginatedResponse = {
  data: mockGames,
  total: 120,
}

const stateStore = new Map<string, Ref>()
mockNuxtImport('useState', () => (key: string, init?: () => unknown) => {
  if (!stateStore.has(key)) {
    stateStore.set(key, ref(init?.()))
  }
  return stateStore.get(key)!
})

mockNuxtImport('useAsyncData', () => (_key: string, fetcher: () => Promise<unknown>) => {
  const status = ref('pending')
  fetcher().then(() => {
    status.value = 'success'
  })
  return { status }
})

describe('useGames', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    stateStore.clear()
    mockFetch.mockResolvedValue(mockPaginatedResponse)
  })

  it('loads first page via useAsyncData and exposes games', async () => {
    const { games, total, status } = useGames()
    await vi.waitFor(() => expect(status.value).toBe('success'))
    expect(games.value).toEqual(mockGames)
    expect(total.value).toBe(120)
    expect(mockFetch).toHaveBeenCalledWith('/api/games', {
      params: { page: 1, limit: 50 },
    })
  })

  it('hasMore is true when loaded < total', async () => {
    const { hasMore, status } = useGames()
    await vi.waitFor(() => expect(status.value).toBe('success'))
    expect(hasMore.value).toBe(true)
  })

  it('loadMore appends next page', async () => {
    const nextPage = [{ id: 'game-3', date: '2026-03-20' }]
    mockFetch
      .mockResolvedValueOnce(mockPaginatedResponse)
      .mockResolvedValueOnce({ data: nextPage, total: 120 })

    const { games, loadMore, status } = useGames()
    await vi.waitFor(() => expect(status.value).toBe('success'))

    await loadMore()

    expect(games.value).toEqual([...mockGames, ...nextPage])
    expect(mockFetch).toHaveBeenLastCalledWith('/api/games', {
      params: { page: 2, limit: 50 },
    })
  })

  it('loadMore is no-op when hasMore is false', async () => {
    mockFetch.mockResolvedValue({ data: mockGames, total: 2 })
    const { loadMore, status } = useGames()
    await vi.waitFor(() => expect(status.value).toBe('success'))

    const callCount = mockFetch.mock.calls.length
    await loadMore()
    expect(mockFetch).toHaveBeenCalledTimes(callCount)
  })
})

describe('useGameActions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockResolvedValue(mockGames[0])
    mockApi.mockResolvedValue(mockGames[0])
  })

  describe('getById', () => {
    it('fetches game from server API via $fetch', async () => {
      const { getById } = useGameActions()
      const result = await getById('game-1')
      expect(result).toEqual(mockGames[0])
      expect(mockFetch).toHaveBeenCalledWith('/api/games/game-1')
    })
  })

  describe('create', () => {
    it('creates game via $api', async () => {
      const newGame = { id: 'game-3', date: '2026-04-07', script: 'trouble_brewing' }
      mockApi.mockResolvedValue(newGame)

      const { create } = useGameActions()
      const result = await create({
        date: '2026-04-07',
        script: 'trouble_brewing',
      })

      expect(result).toEqual(newGame)
      expect(mockApi).toHaveBeenCalledWith('/api/games', {
        method: 'POST',
        body: { date: '2026-04-07', script: 'trouble_brewing' },
      })
    })
  })

  describe('update', () => {
    it('updates game via $api', async () => {
      const updated = { ...mockGames[0], status: 'finished' }
      mockApi.mockResolvedValue(updated)

      const { update } = useGameActions()
      const result = await update('game-1', { status: 'finished' })

      expect(result).toEqual(updated)
      expect(mockApi).toHaveBeenCalledWith('/api/games/game-1', {
        method: 'PUT',
        body: { status: 'finished' },
      })
    })
  })

  describe('remove', () => {
    it('deletes game via $api', async () => {
      mockApi.mockResolvedValue({ success: true })

      const { remove } = useGameActions()
      await remove('game-1')

      expect(mockApi).toHaveBeenCalledWith('/api/games/game-1', {
        method: 'DELETE',
      })
    })
  })
})
