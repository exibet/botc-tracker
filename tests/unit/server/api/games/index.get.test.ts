import { beforeEach, describe, expect, it } from 'vitest'
import type {
  MockSupabaseClient } from '../../../../helpers/server'
import {
  createMockEvent,
  expectHttpError,
  setupServerMocks,
} from '../../../../helpers/server'

describe('GET /api/games', () => {
  let client: MockSupabaseClient

  beforeEach(() => {
    client = setupServerMocks()
  })

  it('returns paginated games with total', async () => {
    client.__response.data = [{ id: '1', date: '2026-01-01' }]
    client.__response.count = 42

    const { default: handler } = await import('~~/server/api/games/index.get')
    const result = await handler(createMockEvent({ query: { page: 1, limit: 50 } }))

    expect(result).toEqual({ data: [{ id: '1', date: '2026-01-01' }], total: 42 })
    expect(client.from).toHaveBeenCalledWith('games')
    expect(client.__builder.range).toHaveBeenCalledWith(0, 49)
  })

  it('applies default pagination when params absent', async () => {
    const { default: handler } = await import('~~/server/api/games/index.get')
    await handler(createMockEvent({ query: {} }))
    expect(client.__builder.range).toHaveBeenCalledWith(0, 49)
  })

  it('computes offset from page', async () => {
    const { default: handler } = await import('~~/server/api/games/index.get')
    await handler(createMockEvent({ query: { page: 3, limit: 20 } }))
    expect(client.__builder.range).toHaveBeenCalledWith(40, 59)
  })

  it('clamps limit to max 100', async () => {
    const { default: handler } = await import('~~/server/api/games/index.get')
    await handler(createMockEvent({ query: { limit: 9999 } }))
    expect(client.__builder.range).toHaveBeenCalledWith(0, 99)
  })

  it('returns 500 with generic message on DB error', async () => {
    client.__response.error = { message: 'relation "games" does not exist' }

    const { default: handler } = await import('~~/server/api/games/index.get')
    await expectHttpError(
      () => handler(createMockEvent()),
      500,
      'Не вдалося завантажити ігри',
    )
  })

  it('does not leak raw error message', async () => {
    client.__response.error = { message: 'relation "games" does not exist' }

    const { default: handler } = await import('~~/server/api/games/index.get')
    try {
      await handler(createMockEvent())
    }
    catch (e) {
      expect((e as Error).message).not.toContain('relation')
    }
  })
})
