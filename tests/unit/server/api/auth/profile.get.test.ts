import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockEvent,
  expectHttpError,
  setupServerMocks,
} from '../../../../helpers/server'
import { USER_PROFILE } from '../../../../helpers/fixtures'

describe('GET /api/auth/profile', () => {
  beforeEach(() => {
    setupServerMocks()
  })

  it('returns profile when authenticated', async () => {
    vi.stubGlobal('getProfile', vi.fn(async () => USER_PROFILE))

    const { default: handler } = await import('~~/server/api/auth/profile.get')
    const result = await handler(createMockEvent())
    expect(result).toEqual(USER_PROFILE)
  })

  it('returns 401 when no profile', async () => {
    vi.stubGlobal('getProfile', vi.fn(async () => null))

    const { default: handler } = await import('~~/server/api/auth/profile.get')
    await expectHttpError(() => handler(createMockEvent()), 401, 'Unauthorized')
  })
})
