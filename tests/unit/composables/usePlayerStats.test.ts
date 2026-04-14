import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

const ROLE_TOWN = { name_ua: 'Емпат', name_en: 'Empath', type: 'townsfolk', image_url: null }
const ROLE_DEMON = { name_ua: 'Імп', name_en: 'Imp', type: 'demon', image_url: null }

function gameRow(overrides: Record<string, unknown> = {}) {
  return {
    game_id: 'g1',
    alignment_start: 'good',
    alignment_end: null,
    is_alive: true,
    is_mvp: false,
    starting_role: ROLE_TOWN,
    ending_role: null,
    game: {
      id: 'g1',
      date: '2026-01-01',
      script: 'trouble_brewing',
      status: 'finished',
      winner: 'good',
      created_at: '2026-01-01T00:00:00Z',
    },
    ...overrides,
  }
}

const fetchData = ref<{ profile: unknown, games: unknown[] } | null>(null)

mockNuxtImport('useFetch', () => () => ({
  data: fetchData,
  status: ref('success'),
}))

describe('usePlayerStats', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fetchData.value = { profile: { id: 'p1', nickname: 'Alice' }, games: [] }
  })

  describe('player', () => {
    it('returns profile from fetch data', () => {
      fetchData.value = { profile: { id: 'p1', nickname: 'Alice' }, games: [] }
      const { player } = usePlayerStats('p1')
      expect(player.value).toEqual({ id: 'p1', nickname: 'Alice' })
    })

    it('returns null when no data', () => {
      fetchData.value = null
      const { player } = usePlayerStats('p1')
      expect(player.value).toBeNull()
    })
  })

  describe('stats', () => {
    it('computes win/loss from games', () => {
      fetchData.value = {
        profile: { id: 'p1' },
        games: [
          gameRow({ alignment_start: 'good', game: { ...gameRow().game, winner: 'good' } }),
          gameRow({ alignment_start: 'evil', game: { ...gameRow().game, winner: 'good' } }),
        ],
      }
      const { stats } = usePlayerStats('p1')
      expect(stats.value.totalGames).toBe(2)
      expect(stats.value.wins).toBe(1)
      expect(stats.value.losses).toBe(1)
    })
  })

  describe('rolePlayCounts', () => {
    it('counts roles, sorted by count desc', () => {
      fetchData.value = {
        profile: { id: 'p1' },
        games: [gameRow(), gameRow(), gameRow({ starting_role: ROLE_DEMON })],
      }
      const { rolePlayCounts } = usePlayerStats('p1')
      expect(rolePlayCounts.value).toHaveLength(2)
      expect(rolePlayCounts.value[0]!.roleNameEn).toBe('Empath')
      expect(rolePlayCounts.value[0]!.count).toBe(2)
      expect(rolePlayCounts.value[1]!.roleNameEn).toBe('Imp')
    })

    it('counts both starting and ending role when changed', () => {
      fetchData.value = {
        profile: { id: 'p1' },
        games: [gameRow({ starting_role: ROLE_TOWN, ending_role: ROLE_DEMON })],
      }
      const { rolePlayCounts } = usePlayerStats('p1')
      expect(rolePlayCounts.value).toHaveLength(2)
    })
  })

  describe('gameHistory', () => {
    it('filters out non-finished games', () => {
      fetchData.value = {
        profile: { id: 'p1' },
        games: [
          gameRow({ game: { ...gameRow().game, status: 'in_progress', winner: null } }),
          gameRow(),
        ],
      }
      const { gameHistory } = usePlayerStats('p1')
      expect(gameHistory.value).toHaveLength(1)
    })

    it('sorts by date desc', () => {
      fetchData.value = {
        profile: { id: 'p1' },
        games: [
          gameRow({ game: { ...gameRow().game, id: 'old', date: '2026-01-01' } }),
          gameRow({ game: { ...gameRow().game, id: 'new', date: '2026-03-01' } }),
        ],
      }
      const { gameHistory } = usePlayerStats('p1')
      expect(gameHistory.value[0]!.gameId).toBe('new')
    })
  })

  describe('winStreak', () => {
    it('counts consecutive recent wins', () => {
      fetchData.value = {
        profile: { id: 'p1' },
        games: [
          gameRow({ alignment_start: 'good', game: { ...gameRow().game, id: 'g3', date: '2026-03-01', winner: 'good' } }),
          gameRow({ alignment_start: 'good', game: { ...gameRow().game, id: 'g2', date: '2026-02-01', winner: 'good' } }),
          gameRow({ alignment_start: 'evil', game: { ...gameRow().game, id: 'g1', date: '2026-01-01', winner: 'good' } }),
        ],
      }
      const { winStreak } = usePlayerStats('p1')
      expect(winStreak.value).toBe(2)
    })

    it('returns 0 when latest game lost', () => {
      fetchData.value = {
        profile: { id: 'p1' },
        games: [gameRow({ alignment_start: 'evil', game: { ...gameRow().game, winner: 'good' } })],
      }
      const { winStreak } = usePlayerStats('p1')
      expect(winStreak.value).toBe(0)
    })
  })
})
