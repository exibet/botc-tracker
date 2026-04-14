import { beforeEach, describe, expect, it } from 'vitest'
import type {
  MockSupabaseClient } from '../../../../helpers/server'
import {
  createMockEvent,
  expectHttpError,
  setupServerMocks,
} from '../../../../helpers/server'
import { ADMIN_PROFILE, INVALID_UUID, USER_PROFILE, VALID_UUID } from '../../../../helpers/fixtures'

describe('DELETE /api/games/[id]', () => {
  let client: MockSupabaseClient

  it('rejects non-admin users', async () => {
    client = setupServerMocks({ authProfile: USER_PROFILE })
    const { default: handler } = await import('~~/server/api/games/[id].delete')
    await expectHttpError(
      () => handler(createMockEvent({ params: { id: VALID_UUID } })),
      403,
    )
  })

  describe('as admin', () => {
    beforeEach(() => {
      client = setupServerMocks({ authProfile: ADMIN_PROFILE,
      })
    })

    it('rejects invalid UUID', async () => {
      const { default: handler } = await import('~~/server/api/games/[id].delete')
      await expectHttpError(
        () => handler(createMockEvent({ params: { id: INVALID_UUID } })),
        400,
      )
    })

    it('deletes game and returns success', async () => {
      const { default: handler } = await import('~~/server/api/games/[id].delete')
      const result = await handler(createMockEvent({ params: { id: VALID_UUID } }))

      expect(result).toEqual({ success: true })
      expect(client.__builder.delete).toHaveBeenCalled()
      expect(client.__builder.eq).toHaveBeenCalledWith('id', VALID_UUID)
    })

    it('returns 400 with generic message on DB error', async () => {
      client.__response.error = { message: 'foreign key violation' }

      const { default: handler } = await import('~~/server/api/games/[id].delete')
      await expectHttpError(
        () => handler(createMockEvent({ params: { id: VALID_UUID } })),
        400,
        'Не вдалося видалити гру',
      )
    })
  })
})
