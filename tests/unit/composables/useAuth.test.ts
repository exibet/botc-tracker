import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

const mockUser = ref<{ id: string } | null>(null)
const mockSignInWithOAuth = vi.fn().mockResolvedValue({ error: null })
const mockSignOut = vi.fn().mockResolvedValue({ error: null })
const mockMaybeSingle = vi.fn().mockResolvedValue({ data: null, error: null })

mockNuxtImport('useSupabaseUser', () => () => mockUser)
mockNuxtImport('useSupabaseClient', () => () => ({
  auth: {
    signInWithOAuth: mockSignInWithOAuth,
    signOut: mockSignOut,
  },
  from: () => ({
    select: () => ({
      eq: () => ({ maybeSingle: mockMaybeSingle }),
    }),
  }),
}))

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUser.value = null
    mockMaybeSingle.mockResolvedValue({ data: null, error: null })
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

  describe('loadProfile', () => {
    it('fetches and sets profile for given user id', async () => {
      const mockProfile = {
        id: 'user-1',
        nickname: 'Test',
        avatar_url: null,
        role: 'player',
        created_at: '2026-01-01',
      }
      mockMaybeSingle.mockResolvedValue({ data: mockProfile, error: null })

      const { loadProfile, profile, profileReady } = useAuth()
      await loadProfile('user-1')

      expect(profile.value).toEqual(mockProfile)
      expect(profileReady.value).toBe(true)
    })

    it('sets profileReady even when profile not found', async () => {
      mockMaybeSingle.mockResolvedValue({ data: null, error: null })

      const { loadProfile, profile, profileReady } = useAuth()
      await loadProfile('user-1')

      expect(profile.value).toBeNull()
      expect(profileReady.value).toBe(true)
    })

    it('sets isAdmin true for admin profile', async () => {
      const adminProfile = {
        id: 'admin-1',
        nickname: 'Admin',
        avatar_url: null,
        role: 'admin',
        created_at: '2026-01-01',
      }
      mockMaybeSingle.mockResolvedValue({ data: adminProfile, error: null })

      const { loadProfile, isAdmin } = useAuth()
      await loadProfile('admin-1')

      expect(isAdmin.value).toBe(true)
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
      const { signOut, profile, profileReady } = useAuth()
      await signOut()

      expect(mockSignOut).toHaveBeenCalled()
      expect(profile.value).toBeNull()
      expect(profileReady.value).toBe(false)
    })
  })
})
