import { beforeEach, describe, expect, it } from 'vitest'
import type {
  MockSupabaseClient } from '../../../helpers/server'
import {
  createMockEvent,
  expectHttpError,
  setupServerMocks,
} from '../../../helpers/server'

describe('GET /api/home', () => {
  let client: MockSupabaseClient

  beforeEach(() => {
    client = setupServerMocks()
  })

  it('returns inProgressGames, upcomingGames, recentGames, topPlayers', async () => {
    client.__response.data = []

    const { default: handler } = await import('~~/server/api/home.get')
    const result = await handler(createMockEvent())

    expect(result).toHaveProperty('inProgressGames')
    expect(result).toHaveProperty('upcomingGames')
    expect(result).toHaveProperty('recentGames')
    expect(result).toHaveProperty('topPlayers')
  })

  it('returns 500 with generic message on DB error', async () => {
    client.__response.error = { message: 'relation "games" violation' }

    const { default: handler } = await import('~~/server/api/home.get')
    await expectHttpError(
      () => handler(createMockEvent()),
      500,
      'Не вдалося завантажити',
    )
  })

  it('does not leak raw error message', async () => {
    client.__response.error = { message: 'relation "games" does not exist' }

    const { default: handler } = await import('~~/server/api/home.get')
    try {
      await handler(createMockEvent())
    }
    catch (e) {
      expect((e as Error).message).not.toContain('relation')
    }
  })
})
