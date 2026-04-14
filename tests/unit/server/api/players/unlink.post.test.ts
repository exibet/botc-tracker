import { beforeEach, describe, expect, it } from 'vitest'
import type {
  MockSupabaseClient } from '../../../../helpers/server'
import {
  createMockEvent,
  expectHttpError,
  setupServerMocks,
} from '../../../../helpers/server'
import { ADMIN_PROFILE, USER_PROFILE } from '../../../../helpers/fixtures'

describe('POST /api/players/unlink', () => {
  let client: MockSupabaseClient

  it('rejects non-admin users', async () => {
    setupServerMocks({ authProfile: USER_PROFILE })
    const { default: handler } = await import('~~/server/api/players/unlink.post')
    await expectHttpError(() => handler(createMockEvent({ body: {} })), 403)
  })

  describe('as admin', () => {
    beforeEach(() => {
      client = setupServerMocks({ authProfile: ADMIN_PROFILE,
      })
    })

    it('calls unlink_profile RPC and returns manualId', async () => {
      client.__response.data = 'new-manual-id'

      const body = { auth_id: 'auth-1', nickname: 'Alice' }
      const { default: handler } = await import('~~/server/api/players/unlink.post')
      const result = await handler(createMockEvent({ body }))

      expect(result).toEqual({ manualId: 'new-manual-id' })
      expect(client.rpc).toHaveBeenCalledWith('unlink_profile', {
        auth_id: 'auth-1',
        manual_nickname: 'Alice',
      })
    })

    it('returns 400 with generic message on DB error', async () => {
      client.__response.error = { message: 'RPC error' }

      const { default: handler } = await import('~~/server/api/players/unlink.post')
      await expectHttpError(
        () => handler(createMockEvent({ body: {} })),
        400,
        'Не вдалося',
      )
    })
  })
})
