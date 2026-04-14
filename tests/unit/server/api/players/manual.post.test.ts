import { beforeEach, describe, expect, it } from 'vitest'
import type {
  MockSupabaseClient } from '../../../../helpers/server'
import {
  createMockEvent,
  expectHttpError,
  setupServerMocks,
} from '../../../../helpers/server'
import { ADMIN_PROFILE, USER_PROFILE } from '../../../../helpers/fixtures'

describe('POST /api/players/manual', () => {
  let client: MockSupabaseClient

  it('rejects non-admin users', async () => {
    setupServerMocks({ authProfile: USER_PROFILE })
    const { default: handler } = await import('~~/server/api/players/manual.post')
    await expectHttpError(() => handler(createMockEvent({ body: {} })), 403)
  })

  describe('as admin', () => {
    beforeEach(() => {
      client = setupServerMocks({ authProfile: ADMIN_PROFILE,
      })
    })

    it('creates manual profile and returns id', async () => {
      client.__response.data = { id: 'new-manual-id' }

      const { default: handler } = await import('~~/server/api/players/manual.post')
      const result = await handler(createMockEvent({ body: { nickname: 'Alice' } }))

      expect(result).toEqual({ id: 'new-manual-id' })
      expect(client.__builder.insert).toHaveBeenCalledWith({
        nickname: 'Alice',
        is_manual: true,
      })
    })

    it('returns 400 with generic message on DB error', async () => {
      client.__response.error = { message: 'unique violation' }

      const { default: handler } = await import('~~/server/api/players/manual.post')
      await expectHttpError(
        () => handler(createMockEvent({ body: { nickname: 'Alice' } })),
        400,
        'Не вдалося створити профіль',
      )
    })
  })
})
