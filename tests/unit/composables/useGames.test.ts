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

// Supabase chain mock — configurable per test
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
  // For list queries (no .single()), the chain itself resolves
  chain.then = vi.fn((resolve: (v: unknown) => void) => resolve(mockQueryResult))
  return chain
}

const mockRefresh = vi.fn()

mockNuxtImport('useSupabaseUser', () => () => ref({ id: 'user-1' }))
mockNuxtImport('useSupabaseClient', () => () => ({
  from: () => createChain(),
}))
mockNuxtImport('useAuth', () => () => ({
  profile: ref({ id: 'user-1', nickname: 'Admin', role: 'admin' }),
  isAuthenticated: computed(() => true),
  isAdmin: computed(() => true),
}))

mockNuxtImport('useAsyncData', () => (_key: string, _fn: () => Promise<unknown>) => {
  // Return mock data directly — the fetcher logic is tested via getById/create/remove
  return { data: ref(mockQueryResult.data), status: ref('success'), refresh: mockRefresh }
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

  describe('getById', () => {
    it('fetches a single game by id', async () => {
      mockQueryResult = { data: mockGames[0], error: null }

      const { getById } = useGames()
      const result = await getById('game-1')
      expect(result).toEqual(mockGames[0])
    })

    it('throws on error', async () => {
      mockQueryResult = { data: null, error: { message: 'Not found' } }

      const { getById } = useGames()
      await expect(getById('bad-id')).rejects.toThrow()
    })
  })

  describe('create', () => {
    it('inserts a new game and refreshes', async () => {
      const newGame = {
        id: 'game-3',
        date: '2026-04-07',
        script: 'trouble_brewing',
        winner: 'good',
      }
      mockQueryResult = { data: newGame, error: null }

      const { create } = useGames()
      const result = await create({
        date: '2026-04-07',
        script: 'trouble_brewing',
        winner: 'good',
      })

      expect(result).toEqual(newGame)
      expect(mockRefresh).toHaveBeenCalled()
    })
  })

  describe('remove', () => {
    it('deletes a game and refreshes', async () => {
      mockQueryResult = { data: null, error: null }

      const { remove } = useGames()
      await remove('game-1')
      expect(mockRefresh).toHaveBeenCalled()
    })
  })
})
