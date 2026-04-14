import { beforeEach, describe, expect, it } from 'vitest'
import type {
  MockSupabaseClient } from '../../../../helpers/server'
import {
  createMockEvent,
  expectHttpError,
  setupServerMocks,
} from '../../../../helpers/server'
import { ADMIN_PROFILE, USER_PROFILE } from '../../../../helpers/fixtures'

describe('POST /api/games', () => {
  let client: MockSupabaseClient

  it('rejects non-authenticated users with 401', async () => {
    client = setupServerMocks({ authProfile: null })
    const { default: handler } = await import('~~/server/api/games/index.post')
    await expectHttpError(() => handler(createMockEvent()), 401)
  })

  it('rejects non-admin users with 403', async () => {
    client = setupServerMocks({ authProfile: USER_PROFILE })
    const { default: handler } = await import('~~/server/api/games/index.post')
    await expectHttpError(() => handler(createMockEvent()), 403)
  })

  describe('as admin', () => {
    beforeEach(() => {
      client = setupServerMocks({ authProfile: ADMIN_PROFILE,
      })
    })

    it('creates game with upcoming status and admin as creator', async () => {
      client.__response.data = { id: 'game-1', status: 'upcoming' }

      const body = { date: '2026-05-01', script: 'trouble_brewing' }
      const { default: handler } = await import('~~/server/api/games/index.post')
      const result = await handler(createMockEvent({ body }))

      expect(result).toEqual({ id: 'game-1', status: 'upcoming' })
      expect(client.__builder.insert).toHaveBeenCalledWith({
        ...body,
        status: 'upcoming',
        created_by: ADMIN_PROFILE.id,
      })
    })

    it('returns 400 with generic message on DB error', async () => {
      client.__response.error = { message: 'violates check constraint' }

      const { default: handler } = await import('~~/server/api/games/index.post')
      await expectHttpError(
        () => handler(createMockEvent({ body: {} })),
        400,
        'Не вдалося створити гру',
      )
    })
  })
})
