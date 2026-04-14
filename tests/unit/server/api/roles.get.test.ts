import { beforeEach, describe, expect, it } from 'vitest'
import type {
  MockSupabaseClient } from '../../../helpers/server'
import {
  createMockEvent,
  expectHttpError,
  setupServerMocks,
} from '../../../helpers/server'

describe('GET /api/roles', () => {
  let client: MockSupabaseClient

  beforeEach(() => {
    client = setupServerMocks()
  })

  it('returns roles ordered by type then name', async () => {
    client.__response.data = [{ id: 'r1', name_en: 'Empath' }]

    const { default: handler } = await import('~~/server/api/roles.get')
    const result = await handler(createMockEvent())

    expect(result).toEqual([{ id: 'r1', name_en: 'Empath' }])
    expect(client.from).toHaveBeenCalledWith('roles')
  })

  it('returns 500 with generic message on DB error', async () => {
    client.__response.error = { message: 'DB error' }

    const { default: handler } = await import('~~/server/api/roles.get')
    await expectHttpError(
      () => handler(createMockEvent()),
      500,
      'Не вдалося завантажити ролі',
    )
  })
})
