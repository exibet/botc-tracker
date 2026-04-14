import { beforeEach, describe, expect, it } from 'vitest'
import type {
  MockSupabaseClient } from '../../../../helpers/server'
import {
  createMockEvent,
  expectHttpError,
  setupServerMocks,
} from '../../../../helpers/server'
import { ADMIN_PROFILE, INVALID_UUID, OTHER_USER_PROFILE, USER_PROFILE, VALID_UUID } from '../../../../helpers/fixtures'

describe('DELETE /api/game-players/[id]', () => {
  let client: MockSupabaseClient

  it('rejects non-authenticated users', async () => {
    setupServerMocks({ authProfile: null })
    const { default: handler } = await import('~~/server/api/game-players/[id].delete')
    await expectHttpError(
      () => handler(createMockEvent({ params: { id: VALID_UUID } })),
      401,
    )
  })

  it('rejects invalid UUID', async () => {
    setupServerMocks({ authProfile: USER_PROFILE })
    const { default: handler } = await import('~~/server/api/game-players/[id].delete')
    await expectHttpError(
      () => handler(createMockEvent({ params: { id: INVALID_UUID } })),
      400,
    )
  })

  it('IDOR: rejects non-owner non-admin with 403', async () => {
    client = setupServerMocks({ authProfile: OTHER_USER_PROFILE })
    client.__response.data = { player_id: USER_PROFILE.id }

    const { default: handler } = await import('~~/server/api/game-players/[id].delete')
    await expectHttpError(
      () => handler(createMockEvent({ params: { id: VALID_UUID } })),
      403,
    )
  })

  it('allows owner to delete own entry', async () => {
    client = setupServerMocks({ authProfile: USER_PROFILE })
    client.__response.data = { player_id: USER_PROFILE.id }

    const { default: handler } = await import('~~/server/api/game-players/[id].delete')
    const result = await handler(createMockEvent({ params: { id: VALID_UUID } }))

    expect(result).toEqual({ success: true })
    expect(client.__builder.delete).toHaveBeenCalled()
  })

  describe('as admin', () => {
    beforeEach(() => {
      client = setupServerMocks({ authProfile: ADMIN_PROFILE,
      })
    })

    it('allows delete without ownership check', async () => {
      const { default: handler } = await import('~~/server/api/game-players/[id].delete')
      const result = await handler(createMockEvent({ params: { id: VALID_UUID } }))
      expect(result).toEqual({ success: true })
    })

    it('returns 400 with generic message on DB error', async () => {
      client.__response.error = { message: 'foreign key violation' }

      const { default: handler } = await import('~~/server/api/game-players/[id].delete')
      await expectHttpError(
        () => handler(createMockEvent({ params: { id: VALID_UUID } })),
        400,
        'Не вдалося видалити запис гравця',
      )
    })
  })
})
