import { beforeEach, describe, expect, it } from 'vitest'
import type {
  MockSupabaseClient } from '../../../../helpers/server'
import {
  createMockEvent,
  expectHttpError,
  setupServerMocks,
} from '../../../../helpers/server'
import { USER_PROFILE } from '../../../../helpers/fixtures'

describe('POST /api/game-players', () => {
  let client: MockSupabaseClient

  it('rejects non-authenticated users', async () => {
    setupServerMocks({ authProfile: null })
    const { default: handler } = await import('~~/server/api/game-players/index.post')
    await expectHttpError(() => handler(createMockEvent({ body: {} })), 401)
  })

  describe('as authenticated user', () => {
    beforeEach(() => {
      client = setupServerMocks({ authProfile: USER_PROFILE,
      })
    })

    it('inserts record with returned details', async () => {
      client.__response.data = { id: 'gp-1', player_id: 'player-1' }

      const body = {
        game_id: 'game-1',
        player_id: 'player-1',
        added_by: USER_PROFILE.id,
      }
      const { default: handler } = await import('~~/server/api/game-players/index.post')
      const result = await handler(createMockEvent({ body }))

      expect(result).toEqual({ id: 'gp-1', player_id: 'player-1' })
      expect(client.__builder.insert).toHaveBeenCalledWith(body)
    })

    it('returns 400 with generic message on DB error', async () => {
      client.__response.error = { message: 'duplicate key violation' }

      const { default: handler } = await import('~~/server/api/game-players/index.post')
      await expectHttpError(
        () => handler(createMockEvent({ body: {} })),
        400,
        'Не вдалося додати гравця',
      )
    })
  })
})
