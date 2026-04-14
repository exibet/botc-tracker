import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

const { mockFetch, mockApi } = vi.hoisted(() => ({
  mockFetch: vi.fn(),
  mockApi: vi.fn(),
}))
const mockUser = ref<{ sub: string } | null>(null)

vi.stubGlobal('$fetch', mockFetch)
vi.stubGlobal('$api', mockApi)
mockNuxtImport('$api', () => mockApi)
mockNuxtImport('useSupabaseUser', () => () => mockUser)

const VOTE_A = { id: 'v1', game_id: 'g1', voter_id: 'u1', candidate_id: 'p1', created_at: '2026-01-01' }
const VOTE_B = { id: 'v2', game_id: 'g1', voter_id: 'u2', candidate_id: 'p1', created_at: '2026-01-01' }
const VOTE_C = { id: 'v3', game_id: 'g1', voter_id: 'u3', candidate_id: 'p2', created_at: '2026-01-01' }

const PLAYER_1 = { id: 'gp1', player: { id: 'p1', nickname: 'Alice', avatar_url: null } } as never
const PLAYER_2 = { id: 'gp2', player: { id: 'p2', nickname: 'Bob', avatar_url: null } } as never

describe('useMvpVoting', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUser.value = null
  })

  describe('initialVotes path', () => {
    it('uses initialVotes without fetching', () => {
      const { votes } = useMvpVoting('g1', [VOTE_A])
      expect(votes.value).toEqual([VOTE_A])
      expect(mockFetch).not.toHaveBeenCalled()
    })
  })

  describe('myVote', () => {
    it('returns null when no user', () => {
      const { myVote } = useMvpVoting('g1', [VOTE_A])
      expect(myVote(null)).toBeNull()
    })

    it('returns the user’s vote when present', () => {
      const { myVote } = useMvpVoting('g1', [VOTE_A, VOTE_B])
      expect(myVote('u1')).toEqual(VOTE_A)
    })

    it('returns null when user has no vote', () => {
      const { myVote } = useMvpVoting('g1', [VOTE_A])
      expect(myVote('other')).toBeNull()
    })
  })

  describe('castVote', () => {
    it('calls API and updates local votes', async () => {
      mockApi.mockResolvedValue([VOTE_A])

      const { votes, castVote } = useMvpVoting('g1', [])
      await castVote('u1', 'p1')

      expect(mockApi).toHaveBeenCalledWith('/api/votes', {
        method: 'POST',
        body: { game_id: 'g1', candidate_id: 'p1' },
      })
      expect(votes.value).toEqual([VOTE_A])
    })
  })

  describe('removeVote', () => {
    it('calls API and filters out current user vote', async () => {
      mockUser.value = { sub: 'u1' }
      mockApi.mockResolvedValue({ success: true })

      const { votes, removeVote } = useMvpVoting('g1', [VOTE_A, VOTE_B])
      await removeVote('u1')

      expect(mockApi).toHaveBeenCalledWith('/api/votes', {
        method: 'DELETE',
        body: { game_id: 'g1' },
      })
      expect(votes.value).toEqual([VOTE_B])
    })
  })

  describe('voteTally', () => {
    it('returns empty when no votes', () => {
      const { voteTally } = useMvpVoting('g1', [])
      expect(voteTally([PLAYER_1])).toEqual([])
    })

    it('counts votes per candidate, sorted desc', () => {
      const { voteTally } = useMvpVoting('g1', [VOTE_A, VOTE_B, VOTE_C])
      const result = voteTally([PLAYER_1, PLAYER_2])

      expect(result).toEqual([
        { candidateId: 'p1', nickname: 'Alice', avatarUrl: null, voteCount: 2, voters: ['u1', 'u2'] },
        { candidateId: 'p2', nickname: 'Bob', avatarUrl: null, voteCount: 1, voters: ['u3'] },
      ])
    })

    it('skips candidates not in players list', () => {
      const { voteTally } = useMvpVoting('g1', [VOTE_C])
      const result = voteTally([PLAYER_1]) // p2 not in players
      expect(result).toEqual([])
    })
  })
})
