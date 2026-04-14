import { beforeEach, describe, expect, it } from 'vitest'
import type {
  MockSupabaseClient } from '../../../../helpers/server'
import {
  createMockEvent,
  expectHttpError,
  setupServerMocks,
} from '../../../../helpers/server'
import { ADMIN_PROFILE, USER_PROFILE } from '../../../../helpers/fixtures'

describe('POST /api/players/link', () => {
  let client: MockSupabaseClient

  it('rejects non-admin users', async () => {
    setupServerMocks({ authProfile: USER_PROFILE })
    const { default: handler } = await import('~~/server/api/players/link.post')
    await expectHttpError(() => handler(createMockEvent({ body: {} })), 403)
  })

  describe('as admin', () => {
    beforeEach(() => {
      client = setupServerMocks({ authProfile: ADMIN_PROFILE,
      })
    })

    it('calls link_manual_profile RPC', async () => {
      const body = { manual_id: 'manual-1', auth_id: 'auth-1' }
      const { default: handler } = await import('~~/server/api/players/link.post')
      const result = await handler(createMockEvent({ body }))

      expect(result).toEqual({ success: true })
      expect(client.rpc).toHaveBeenCalledWith('link_manual_profile', body)
    })

    it('returns 400 with generic message on DB error', async () => {
      client.__response.error = { message: 'RPC error' }

      const { default: handler } = await import('~~/server/api/players/link.post')
      await expectHttpError(
        () => handler(createMockEvent({ body: {} })),
        400,
        'Не вдалося',
      )
    })
  })
})
