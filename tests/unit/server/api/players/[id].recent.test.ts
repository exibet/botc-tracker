import { beforeEach, describe, expect, it } from 'vitest'
import type {
  MockSupabaseClient } from '../../../../helpers/server'
import {
  createMockEvent,
  expectHttpError,
  setupServerMocks,
} from '../../../../helpers/server'
import { INVALID_UUID, VALID_UUID } from '../../../../helpers/fixtures'

describe('GET /api/players/[id]/recent', () => {
  let client: MockSupabaseClient

  beforeEach(() => {
    client = setupServerMocks()
  })

  it('rejects invalid UUID', async () => {
    const { default: handler } = await import('~~/server/api/players/[id]/recent.get')
    await expectHttpError(
      () => handler(createMockEvent({ params: { id: INVALID_UUID } })),
      400,
    )
  })

  it('applies default limit of 5', async () => {
    const { default: handler } = await import('~~/server/api/players/[id]/recent.get')
    await handler(createMockEvent({ params: { id: VALID_UUID } }))
    expect(client.__builder.limit).toHaveBeenCalledWith(5)
  })

  it('applies custom limit when provided', async () => {
    const { default: handler } = await import('~~/server/api/players/[id]/recent.get')
    await handler(createMockEvent({ params: { id: VALID_UUID }, query: { limit: 10 } }))
    expect(client.__builder.limit).toHaveBeenCalledWith(10)
  })

  it('clamps limit to max', async () => {
    const { default: handler } = await import('~~/server/api/players/[id]/recent.get')
    await handler(createMockEvent({ params: { id: VALID_UUID }, query: { limit: 9999 } }))
    expect(client.__builder.limit).toHaveBeenCalledWith(100)
  })

  it('returns 500 on DB error with generic message', async () => {
    client.__response.error = { message: 'DB error' }

    const { default: handler } = await import('~~/server/api/players/[id]/recent.get')
    await expectHttpError(
      () => handler(createMockEvent({ params: { id: VALID_UUID } })),
      500,
      'Не вдалося завантажити ігри гравця',
    )
  })
})
