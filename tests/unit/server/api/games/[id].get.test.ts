import { beforeEach, describe, expect, it } from 'vitest'
import type {
  MockSupabaseClient } from '../../../../helpers/server'
import {
  createMockEvent,
  expectHttpError,
  setupServerMocks,
} from '../../../../helpers/server'
import { INVALID_UUID, VALID_UUID } from '../../../../helpers/fixtures'

describe('GET /api/games/[id]', () => {
  let client: MockSupabaseClient

  beforeEach(() => {
    client = setupServerMocks()
  })

  it('returns game by valid UUID', async () => {
    client.__response.data = { id: VALID_UUID, date: '2026-01-01' }

    const { default: handler } = await import('~~/server/api/games/[id].get')
    const result = await handler(createMockEvent({ params: { id: VALID_UUID } }))

    expect(result).toEqual({ id: VALID_UUID, date: '2026-01-01' })
    expect(client.__builder.eq).toHaveBeenCalledWith('id', VALID_UUID)
  })

  it('rejects invalid UUID with 400', async () => {
    const { default: handler } = await import('~~/server/api/games/[id].get')
    await expectHttpError(() => handler(createMockEvent({ params: { id: INVALID_UUID } })), 400)
  })

  it('returns 404 when game not found', async () => {
    client.__response.error = { message: 'PGRST116: no rows returned' }

    const { default: handler } = await import('~~/server/api/games/[id].get')
    await expectHttpError(() => handler(createMockEvent({ params: { id: VALID_UUID } })), 404)
  })

  it('does not leak DB error details', async () => {
    client.__response.error = { message: 'relation "games" does not exist' }

    const { default: handler } = await import('~~/server/api/games/[id].get')
    try {
      await handler(createMockEvent({ params: { id: VALID_UUID } }))
    }
    catch (e) {
      expect((e as Error).message).not.toContain('relation')
    }
  })
})
