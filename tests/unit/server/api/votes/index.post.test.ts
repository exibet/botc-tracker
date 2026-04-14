import { beforeEach, describe, expect, it } from 'vitest'
import type {
  MockSupabaseClient } from '../../../../helpers/server'
import {
  createMockEvent,
  expectHttpError,
  setupServerMocks,
} from '../../../../helpers/server'
import { USER_PROFILE } from '../../../../helpers/fixtures'

describe('POST /api/votes', () => {
  let client: MockSupabaseClient

  it('rejects non-authenticated users', async () => {
    setupServerMocks({ authProfile: null })
    const { default: handler } = await import('~~/server/api/votes/index.post')
    await expectHttpError(() => handler(createMockEvent({ body: {} })), 401)
  })

  describe('as authenticated user', () => {
    beforeEach(() => {
      client = setupServerMocks({ authProfile: USER_PROFILE,
      })
    })

    it('upserts vote with voter_id from auth profile', async () => {
      client.__response.data = []

      const body = { game_id: 'game-1', candidate_id: 'candidate-1' }
      const { default: handler } = await import('~~/server/api/votes/index.post')
      await handler(createMockEvent({ body }))

      expect(client.__builder.upsert).toHaveBeenCalledWith(
        { game_id: 'game-1', voter_id: USER_PROFILE.id, candidate_id: 'candidate-1' },
        { onConflict: 'game_id,voter_id' },
      )
    })

    it('returns 400 with generic message on DB error', async () => {
      client.__response.error = { message: 'self-vote check failed' }

      const { default: handler } = await import('~~/server/api/votes/index.post')
      await expectHttpError(
        () => handler(createMockEvent({ body: {} })),
        400,
        'Не вдалося зберегти голос',
      )
    })
  })
})
