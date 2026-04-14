import { beforeEach, describe, expect, it } from 'vitest'
import type {
  MockSupabaseClient } from '../../../../helpers/server'
import {
  createMockEvent,
  expectHttpError,
  setupServerMocks,
} from '../../../../helpers/server'
import { INVALID_UUID, VALID_UUID } from '../../../../helpers/fixtures'

describe('GET /api/players/[id]', () => {
  let client: MockSupabaseClient

  beforeEach(() => {
    client = setupServerMocks()
  })

  it('rejects invalid UUID', async () => {
    const { default: handler } = await import('~~/server/api/players/[id].get')
    await expectHttpError(() => handler(createMockEvent({ params: { id: INVALID_UUID } })), 400)
  })

  it('returns profile with games', async () => {
    client.__response.data = { id: VALID_UUID, nickname: 'Alice' }

    const { default: handler } = await import('~~/server/api/players/[id].get')
    const result = await handler(createMockEvent({ params: { id: VALID_UUID } }))

    expect(result).toHaveProperty('profile')
    expect(result).toHaveProperty('games')
  })

  it('returns 404 when profile not found', async () => {
    client.__response.error = { message: 'no rows returned' }

    const { default: handler } = await import('~~/server/api/players/[id].get')
    await expectHttpError(
      () => handler(createMockEvent({ params: { id: VALID_UUID } })),
      404,
      'Player not found',
    )
  })
})
