import { beforeEach, describe, expect, it } from 'vitest'
import type {
  MockSupabaseClient } from '../../../../helpers/server'
import {
  createMockEvent,
  expectHttpError,
  setupServerMocks,
} from '../../../../helpers/server'

describe('GET /api/players/list', () => {
  let client: MockSupabaseClient

  beforeEach(() => {
    client = setupServerMocks()
  })

  it('returns profiles ordered by nickname', async () => {
    client.__response.data = [{ id: 'p1', nickname: 'Alice' }]

    const { default: handler } = await import('~~/server/api/players/list.get')
    const result = await handler(createMockEvent())

    expect(result).toEqual([{ id: 'p1', nickname: 'Alice' }])
    expect(client.__builder.order).toHaveBeenCalledWith('nickname')
  })

  it('returns 500 with generic message on DB error', async () => {
    client.__response.error = { message: 'DB error' }

    const { default: handler } = await import('~~/server/api/players/list.get')
    await expectHttpError(
      () => handler(createMockEvent()),
      500,
      'Не вдалося завантажити гравців',
    )
  })
})
