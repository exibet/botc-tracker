import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

const ROLE_TOWN = { id: 'r1', name_ua: 'Емпат', name_en: 'Empath', image_url: null, type: 'townsfolk' }

const mockEntry = {
  id: 'gp-1',
  game_id: 'game-1',
  player_id: 'p1',
  starting_role_id: 'r1',
  ending_role_id: null,
  alignment_start: 'good',
  alignment_end: null,
  is_alive: true,
  is_mvp: false,
  added_by: 'admin',
  created_at: '2026-01-01',
  player: { id: 'p1', nickname: 'Alice', avatar_url: null },
}

const { mockFetch, mockApi } = vi.hoisted(() => ({
  mockFetch: vi.fn(),
  mockApi: vi.fn(),
}))

vi.stubGlobal('$fetch', mockFetch)
vi.stubGlobal('$api', mockApi)
mockNuxtImport('$api', () => mockApi)

mockNuxtImport('useRoles', () => () => ({
  roles: ref([ROLE_TOWN]),
}))

describe('useGamePlayers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('initialData path', () => {
    it('resolves roles from initial data without fetch', () => {
      const { players, status } = useGamePlayers('game-1', [mockEntry as never])
      expect(status.value).toBe('success')
      expect(players.value).toHaveLength(1)
      expect(players.value![0].starting_role).toEqual(ROLE_TOWN)
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('null initial data triggers fetch', async () => {
      mockFetch.mockResolvedValue({ game_players: [mockEntry] })
      useGamePlayers('game-1')
      await vi.waitFor(() => expect(mockFetch).toHaveBeenCalledWith('/api/games/game-1'))
    })
  })

  describe('fetchPlayers error handling', () => {
    it('sets status to error on fetch failure', async () => {
      mockFetch.mockRejectedValue(new Error('Network down'))
      const { status, refresh } = useGamePlayers('game-1', [])

      await refresh()

      expect(status.value).toBe('error')
    })

    it('sets empty array and success when no game id', async () => {
      const { players, status, refresh } = useGamePlayers('', [])
      await refresh()
      expect(players.value).toEqual([])
      expect(status.value).toBe('success')
    })
  })

  describe('add', () => {
    it('appends new entry to players list (immutable)', async () => {
      mockApi.mockResolvedValue({ ...mockEntry, id: 'gp-2' })

      const { players, add } = useGamePlayers('game-1', [mockEntry as never])
      const before = players.value
      await add({ player_id: 'p2', added_by: 'admin' } as never)

      expect(players.value).toHaveLength(2)
      expect(players.value).not.toBe(before) // new array reference
      expect(mockApi).toHaveBeenCalledWith('/api/game-players', {
        method: 'POST',
        body: { player_id: 'p2', added_by: 'admin', game_id: 'game-1' },
      })
    })
  })

  describe('update', () => {
    it('replaces matching entry', async () => {
      const updated = { ...mockEntry, is_alive: false }
      mockApi.mockResolvedValue(updated)

      const { players, update } = useGamePlayers('game-1', [mockEntry as never])
      await update('gp-1', { is_alive: false })

      expect(players.value![0].is_alive).toBe(false)
      expect(mockApi).toHaveBeenCalledWith('/api/game-players/gp-1', {
        method: 'PUT',
        body: { is_alive: false },
      })
    })
  })

  describe('remove', () => {
    it('removes entry by id', async () => {
      mockApi.mockResolvedValue({ success: true })

      const { players, remove } = useGamePlayers('game-1', [mockEntry as never])
      await remove('gp-1')

      expect(players.value).toHaveLength(0)
      expect(mockApi).toHaveBeenCalledWith('/api/game-players/gp-1', { method: 'DELETE' })
    })
  })

  describe('refreshFromGame', () => {
    it('returns game and votes on success', async () => {
      const game = { game_players: [mockEntry], mvp_votes: [{ id: 'v1' }] }
      mockFetch.mockResolvedValue(game)

      const { refreshFromGame } = useGamePlayers('game-1', [])
      const result = await refreshFromGame()

      expect(result?.game).toEqual(game)
      expect(result?.votes).toEqual([{ id: 'v1' }])
    })

    it('returns null on fetch error', async () => {
      mockFetch.mockRejectedValue(new Error('boom'))

      const { refreshFromGame } = useGamePlayers('game-1', [])
      const result = await refreshFromGame()

      expect(result).toBeNull()
    })
  })
})
