import { beforeEach, describe, expect, it } from 'vitest'
import type {
  MockSupabaseClient } from '../../../../helpers/server'
import {
  createMockEvent,
  expectHttpError,
  setupServerMocks,
} from '../../../../helpers/server'
import { USER_PROFILE } from '../../../../helpers/fixtures'

describe('DELETE /api/votes', () => {
  let client: MockSupabaseClient

  it('rejects non-authenticated users', async () => {
    setupServerMocks({ authProfile: null })
    const { default: handler } = await import('~~/server/api/votes/index.delete')
    await expectHttpError(() => handler(createMockEvent({ body: {} })), 401)
  })

  describe('as authenticated user', () => {
    beforeEach(() => {
      client = setupServerMocks({ authProfile: USER_PROFILE,
      })
    })

    it('deletes vote filtered by game_id and voter_id', async () => {
      const body = { game_id: 'game-1' }
      const { default: handler } = await import('~~/server/api/votes/index.delete')
      const result = await handler(createMockEvent({ body }))

      expect(result).toEqual({ success: true })
      expect(client.__builder.delete).toHaveBeenCalled()
      expect(client.__builder.eq).toHaveBeenCalledWith('game_id', 'game-1')
      expect(client.__builder.eq).toHaveBeenCalledWith('voter_id', USER_PROFILE.id)
    })

    it('returns 400 with generic message on DB error', async () => {
      client.__response.error = { message: 'DB error' }

      const { default: handler } = await import('~~/server/api/votes/index.delete')
      await expectHttpError(
        () => handler(createMockEvent({ body: {} })),
        400,
        'Не вдалося видалити голос',
      )
    })
  })
})
