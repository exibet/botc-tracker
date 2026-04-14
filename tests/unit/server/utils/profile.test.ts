import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  user: null as { sub: string } | null,
  client: null as { from: ReturnType<typeof vi.fn>, [k: string]: unknown } | null,
}))

vi.mock('#supabase/server', () => ({
  serverSupabaseUser: () => Promise.resolve(mocks.user),
  serverSupabaseClient: () => Promise.resolve(mocks.client),
}))

vi.stubGlobal('PROFILE_SELECT', 'id, nickname, avatar_url, role, is_manual, created_at')

describe('getProfile', () => {
  beforeEach(() => {
    mocks.user = null
    mocks.client = null
  })

  it('returns null when no authenticated user', async () => {
    const { getProfile } = await import('~~/server/utils/profile')
    const result = await getProfile({} as never)
    expect(result).toBeNull()
  })

  it('queries profiles table with auth user id', async () => {
    mocks.user = { sub: 'user-1' }
    const profileData = { id: 'user-1', nickname: 'Alice', role: 'player' }
    const eq = vi.fn().mockReturnThis()
    const single = vi.fn(() => Promise.resolve({ data: profileData, error: null }))
    const select = vi.fn().mockReturnThis()
    const from = vi.fn(() => ({ select, eq, single }))
    select.mockImplementation(() => ({ select, eq, single }))
    eq.mockImplementation(() => ({ select, eq, single }))
    mocks.client = { from }

    const { getProfile } = await import('~~/server/utils/profile')
    const result = await getProfile({} as never)

    expect(result).toEqual(profileData)
    expect(from).toHaveBeenCalledWith('profiles')
    expect(eq).toHaveBeenCalledWith('id', 'user-1')
  })
})
