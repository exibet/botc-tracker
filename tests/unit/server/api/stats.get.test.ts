import { beforeEach, describe, expect, it } from 'vitest'
import type {
  MockSupabaseClient } from '../../../helpers/server'
import {
  createMockEvent,
  expectHttpError,
  setupServerMocks,
} from '../../../helpers/server'

describe('GET /api/stats', () => {
  let client: MockSupabaseClient

  beforeEach(() => {
    client = setupServerMocks()
  })

  it('returns stats from RPC', async () => {
    client.__response.data = { totalGames: 10, goodWins: 6, evilWins: 4, totalPlayers: 12 }

    const { default: handler } = await import('~~/server/api/stats.get')
    const result = await handler(createMockEvent())

    expect(result).toEqual({ totalGames: 10, goodWins: 6, evilWins: 4, totalPlayers: 12 })
    expect(client.rpc).toHaveBeenCalledWith('get_home_stats')
  })

  it('returns 500 with generic message on DB error', async () => {
    client.__response.error = { message: 'RPC error' }

    const { default: handler } = await import('~~/server/api/stats.get')
    await expectHttpError(
      () => handler(createMockEvent()),
      500,
      'Не вдалося завантажити статистику',
    )
  })
})
