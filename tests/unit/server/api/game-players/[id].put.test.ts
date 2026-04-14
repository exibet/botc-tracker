import { beforeEach, describe, expect, it } from 'vitest'
import type {
  MockSupabaseClient } from '../../../../helpers/server'
import {
  createMockEvent,
  expectHttpError,
  setupServerMocks,
} from '../../../../helpers/server'
import { ADMIN_PROFILE, INVALID_UUID, OTHER_USER_PROFILE, USER_PROFILE, VALID_UUID } from '../../../../helpers/fixtures'

describe('PUT /api/game-players/[id]', () => {
  let client: MockSupabaseClient

  it('rejects non-authenticated users', async () => {
    setupServerMocks({ authProfile: null })
    const { default: handler } = await import('~~/server/api/game-players/[id].put')
    await expectHttpError(
      () => handler(createMockEvent({ params: { id: VALID_UUID }, body: {} })),
      401,
    )
  })

  it('rejects invalid UUID', async () => {
    setupServerMocks({ authProfile: USER_PROFILE })
    const { default: handler } = await import('~~/server/api/game-players/[id].put')
    await expectHttpError(
      () => handler(createMockEvent({ params: { id: INVALID_UUID }, body: {} })),
      400,
    )
  })

  it('IDOR: rejects non-owner non-admin with 403', async () => {
    client = setupServerMocks({ authProfile: OTHER_USER_PROFILE })
    client.__response.data = { player_id: USER_PROFILE.id }

    const { default: handler } = await import('~~/server/api/game-players/[id].put')
    await expectHttpError(
      () => handler(createMockEvent({ params: { id: VALID_UUID }, body: {} })),
      403,
      'Forbidden',
    )
  })

  it('allows owner to update own entry', async () => {
    client = setupServerMocks({ authProfile: USER_PROFILE })
    client.__response.data = { player_id: USER_PROFILE.id }

    const { default: handler } = await import('~~/server/api/game-players/[id].put')
    await handler(createMockEvent({
      params: { id: VALID_UUID },
      body: { is_alive: false },
    }))

    expect(client.__builder.update).toHaveBeenCalledWith({ is_alive: false })
  })

  describe('as admin', () => {
    beforeEach(() => {
      client = setupServerMocks({ authProfile: ADMIN_PROFILE,
      })
    })

    it('allows update without ownership check', async () => {
      client.__response.data = { id: VALID_UUID, player_id: USER_PROFILE.id }

      const { default: handler } = await import('~~/server/api/game-players/[id].put')
      const result = await handler(createMockEvent({
        params: { id: VALID_UUID },
        body: { is_alive: false },
      }))

      expect(result).toEqual({ id: VALID_UUID, player_id: USER_PROFILE.id })
    })

    it('returns 400 with generic message on DB error', async () => {
      client.__response.error = { message: 'violates constraint' }

      const { default: handler } = await import('~~/server/api/game-players/[id].put')
      await expectHttpError(
        () => handler(createMockEvent({ params: { id: VALID_UUID }, body: {} })),
        400,
        'Не вдалося оновити запис гравця',
      )
    })
  })
})
