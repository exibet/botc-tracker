import { beforeEach, describe, expect, it } from 'vitest'
import type {
  MockSupabaseClient } from '../../../../helpers/server'
import {
  createMockEvent,
  expectHttpError,
  setupServerMocks,
} from '../../../../helpers/server'

describe('GET /api/players (leaderboard)', () => {
  let client: MockSupabaseClient

  beforeEach(() => {
    client = setupServerMocks()
  })

  it('returns leaderboard data via RPC', async () => {
    client.__response.data = [{ id: 'p1', points: 100 }]

    const { default: handler } = await import('~~/server/api/players/index.get')
    const result = await handler(createMockEvent())

    expect(result).toEqual([{ id: 'p1', points: 100 }])
    expect(client.rpc).toHaveBeenCalledWith('get_player_leaderboard', undefined)
  })

  it('passes limit when provided', async () => {
    const { default: handler } = await import('~~/server/api/players/index.get')
    await handler(createMockEvent({ query: { limit: 5 } }))
    expect(client.rpc).toHaveBeenCalledWith('get_player_leaderboard', { result_limit: 5 })
  })

  it('clamps invalid limit to default', async () => {
    const { default: handler } = await import('~~/server/api/players/index.get')
    await handler(createMockEvent({ query: { limit: -1 } }))
    expect(client.rpc).toHaveBeenCalledWith('get_player_leaderboard', { result_limit: 10 })
  })

  it('returns empty array when no data', async () => {
    client.__response.data = null

    const { default: handler } = await import('~~/server/api/players/index.get')
    const result = await handler(createMockEvent())
    expect(result).toEqual([])
  })

  it('returns 500 with generic message on DB error', async () => {
    client.__response.error = { message: 'RPC function not found' }

    const { default: handler } = await import('~~/server/api/players/index.get')
    await expectHttpError(
      () => handler(createMockEvent()),
      500,
      'Не вдалося завантажити гравців',
    )
  })
})
