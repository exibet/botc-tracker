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

// Supabase chain mock — for mutations that still use client
let mockQueryResult: { data: unknown, error: unknown } = { data: mockGames, error: null }

function createChain() {
  const chain: Record<string, ReturnType<typeof vi.fn>> = {}
  const returnChain = () => chain
  chain.select = vi.fn(returnChain)
  chain.insert = vi.fn(returnChain)
  chain.update = vi.fn(returnChain)
  chain.delete = vi.fn(returnChain)
  chain.eq = vi.fn(returnChain)
  chain.order = vi.fn(returnChain)
  chain.single = vi.fn(() => Promise.resolve(mockQueryResult))
  chain.then = vi.fn((resolve: (v: unknown) => void) => resolve(mockQueryResult))
  return chain
}

const { mockFetch } = vi.hoisted(() => ({
  mockFetch: vi.fn(),
}))

vi.stubGlobal('$fetch', mockFetch)

mockNuxtImport('useSupabaseUser', () => () => ref({ id: 'user-1' }))
mockNuxtImport('useSupabaseClient', () => () => ({
  from: () => createChain(),
}))
mockNuxtImport('useAuth', () => () => ({
  profile: ref({ id: 'user-1', nickname: 'Admin', role: 'admin' }),
  isAuthenticated: computed(() => true),
  isAdmin: computed(() => true),
}))
mockNuxtImport('useGameStats', () => () => ({
  refreshStats: vi.fn(),
}))

const mockRefresh = vi.fn()
mockNuxtImport('useAsyncData', () => (_key: string, fn: () => Promise<unknown>) => {
  return { data: ref(mockGames), status: ref('success'), refresh: mockRefresh }
})

describe('useGames', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockQueryResult = { data: mockGames, error: null }
  })

  describe('list', () => {
    it('returns games via useAsyncData', () => {
      const { games, status } = useGames()
      expect(games.value).toEqual(mockGames)
      expect(status.value).toBe('success')
    })
  })
})

describe('useGameActions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockQueryResult = { data: mockGames, error: null }
    mockFetch.mockResolvedValue(mockGames[0])
  })

  describe('getById', () => {
    it('fetches game from server API', async () => {
      const { getById } = useGameActions()
      const result = await getById('game-1')
      expect(result).toEqual(mockGames[0])
      expect(mockFetch).toHaveBeenCalledWith('/api/games/game-1')
    })
  })

  describe('create', () => {
    it('inserts a new game via supabase client', async () => {
      const newGame = {
        id: 'game-3',
        date: '2026-04-07',
        script: 'trouble_brewing',
        winner: 'good',
      }
      mockQueryResult = { data: newGame, error: null }

      const { create } = useGameActions()
      const result = await create({
        date: '2026-04-07',
        script: 'trouble_brewing',
      })

      expect(result).toEqual(newGame)
    })
  })

  describe('remove', () => {
    it('deletes a game via supabase client', async () => {
      mockQueryResult = { data: null, error: null }

      const { remove } = useGameActions()
      await remove('game-1')
    })
  })
})
