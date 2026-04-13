import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

const mockUser = ref<{ id: string } | null>(null)
const mockSignInWithOAuth = vi.fn().mockResolvedValue({ error: null })
const mockSignOut = vi.fn().mockResolvedValue({ error: null })

const { mockFetch } = vi.hoisted(() => ({
  mockFetch: vi.fn(),
}))

mockNuxtImport('useSupabaseUser', () => () => mockUser)
mockNuxtImport('useSupabaseClient', () => () => ({
  auth: {
    signInWithOAuth: mockSignInWithOAuth,
    signOut: mockSignOut,
  },
}))

vi.stubGlobal('$fetch', mockFetch)

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUser.value = null
    mockFetch.mockResolvedValue(null)
  })

  describe('reactive state', () => {
    it('isAuthenticated is false when no user', () => {
      const { isAuthenticated } = useAuth()
      expect(isAuthenticated.value).toBe(false)
    })

    it('isAuthenticated is true when user exists', () => {
      mockUser.value = { id: 'user-1' }
      const { isAuthenticated } = useAuth()
      expect(isAuthenticated.value).toBe(true)
    })

    it('isAdmin is false when no profile', () => {
      const { isAdmin } = useAuth()
      expect(isAdmin.value).toBe(false)
    })
  })

  describe('setProfile', () => {
    it('sets profile directly', () => {
      const { setProfile, profile, isAdmin } = useAuth()
      setProfile({
        id: 'user-1',
        nickname: 'Admin',
        avatar_url: null,
        role: 'admin',
        is_manual: false,
        created_at: '2026-01-01',
      })
      expect(profile.value?.nickname).toBe('Admin')
      expect(isAdmin.value).toBe(true)
    })
  })

  describe('loadProfile', () => {
    it('fetches profile from API', async () => {
      const mockProfile = {
        id: 'user-1',
        nickname: 'Test',
        avatar_url: null,
        role: 'player',
        is_manual: false,
        created_at: '2026-01-01',
      }
      mockFetch.mockResolvedValue(mockProfile)

      const { loadProfile, profile } = useAuth()
      await loadProfile()

      expect(profile.value).toEqual(mockProfile)
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/profile')
    })

    it('sets profile to null on fetch error', async () => {
      mockFetch.mockRejectedValue(new Error('Unauthorized'))

      const { loadProfile, profile } = useAuth()
      await loadProfile()

      expect(profile.value).toBeNull()
    })
  })

  describe('signInWithGoogle', () => {
    it('calls supabase signInWithOAuth with google', async () => {
      const { signInWithGoogle } = useAuth()
      await signInWithGoogle()

      expect(mockSignInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: expect.stringContaining('/confirm'),
        },
      })
    })
  })

  describe('signOut', () => {
    it('calls supabase signOut and clears profile', async () => {
      const { signOut, profile } = useAuth()
      await signOut()

      expect(mockSignOut).toHaveBeenCalled()
      expect(profile.value).toBeNull()
    })
  })

  it('does not export profileReady or waitForProfile', () => {
    const result = useAuth()
    expect(result).not.toHaveProperty('profileReady')
    expect(result).not.toHaveProperty('waitForProfile')
  })
})
