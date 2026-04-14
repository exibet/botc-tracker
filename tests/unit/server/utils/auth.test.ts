import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getEventProfile, requireAdmin, requireAuth } from '~~/server/utils/auth'

const ADMIN = { id: 'admin-id', role: 'admin', nickname: 'Admin' }
const USER = { id: 'user-id', role: 'player', nickname: 'User' }

function createHttpError(opts: { statusCode: number, message: string }) {
  const err = new Error(opts.message) as Error & { statusCode: number }
  err.statusCode = opts.statusCode
  return err
}

vi.stubGlobal('createError', createHttpError)

function createEvent(profile: unknown) {
  return {
    context: {
      getProfile: vi.fn(async () => profile),
    },
  } as never
}

describe('getEventProfile', () => {
  it('returns profile from event context', async () => {
    const event = createEvent(USER)
    const result = await getEventProfile(event)
    expect(result).toEqual(USER)
  })

  it('returns null when getProfile missing', async () => {
    const event = { context: {} } as never
    const result = await getEventProfile(event)
    expect(result).toBeNull()
  })

  it('returns null when getProfile resolves to null', async () => {
    const event = createEvent(null)
    const result = await getEventProfile(event)
    expect(result).toBeNull()
  })
})

describe('requireAuth', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns profile when authenticated', async () => {
    const event = createEvent(USER)
    const result = await requireAuth(event)
    expect(result).toEqual(USER)
  })

  it('throws 401 when no profile', async () => {
    const event = createEvent(null)
    try {
      await requireAuth(event)
      throw new Error('should have thrown')
    }
    catch (e) {
      expect((e as Error & { statusCode: number }).statusCode).toBe(401)
    }
  })
})

describe('requireAdmin', () => {
  it('returns profile when admin', async () => {
    const event = createEvent(ADMIN)
    const result = await requireAdmin(event)
    expect(result).toEqual(ADMIN)
  })

  it('throws 403 when authenticated but not admin', async () => {
    const event = createEvent(USER)
    try {
      await requireAdmin(event)
      throw new Error('should have thrown')
    }
    catch (e) {
      expect((e as Error & { statusCode: number }).statusCode).toBe(403)
    }
  })

  it('throws 401 when not authenticated', async () => {
    const event = createEvent(null)
    try {
      await requireAdmin(event)
      throw new Error('should have thrown')
    }
    catch (e) {
      expect((e as Error & { statusCode: number }).statusCode).toBe(401)
    }
  })
})
