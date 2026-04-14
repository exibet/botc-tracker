import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CACHE_NAMES } from '~~/server/utils/cache'
import type {
  MockSupabaseClient } from '../../../../helpers/server'
import {
  createMockEvent,
  expectHttpError,
  setupServerMocks,
} from '../../../../helpers/server'
import { ADMIN_PROFILE, INVALID_UUID, USER_PROFILE, VALID_UUID } from '../../../../helpers/fixtures'

describe('PUT /api/games/[id]', () => {
  let client: MockSupabaseClient
  let invalidateMock: ReturnType<typeof vi.fn>

  it('rejects non-admin users', async () => {
    client = setupServerMocks({ authProfile: USER_PROFILE })
    const { default: handler } = await import('~~/server/api/games/[id].put')
    await expectHttpError(
      () => handler(createMockEvent({ params: { id: VALID_UUID }, body: {} })),
      403,
    )
  })

  describe('as admin', () => {
    beforeEach(() => {
      client = setupServerMocks({ authProfile: ADMIN_PROFILE })
      invalidateMock = vi.fn(async () => {})
      vi.stubGlobal('invalidateCache', invalidateMock)
    })

    it('rejects invalid UUID', async () => {
      const { default: handler } = await import('~~/server/api/games/[id].put')
      await expectHttpError(
        () => handler(createMockEvent({ params: { id: INVALID_UUID }, body: {} })),
        400,
      )
    })

    it('updates game and returns data', async () => {
      client.__response.data = { id: VALID_UUID, date: '2026-05-01' }

      const { default: handler } = await import('~~/server/api/games/[id].put')
      const result = await handler(createMockEvent({
        params: { id: VALID_UUID },
        body: { date: '2026-05-01' },
      }))

      expect(result).toEqual({ id: VALID_UUID, date: '2026-05-01' })
      expect(client.__builder.update).toHaveBeenCalledWith({ date: '2026-05-01' })
      expect(client.__builder.eq).toHaveBeenCalledWith('id', VALID_UUID)
    })

    it('invalidates leaderboard + stats cache when status=finished', async () => {
      client.__response.data = { id: VALID_UUID }

      const { default: handler } = await import('~~/server/api/games/[id].put')
      await handler(createMockEvent({
        params: { id: VALID_UUID },
        body: { status: 'finished' },
      }))

      expect(invalidateMock).toHaveBeenCalledWith(CACHE_NAMES.PLAYERS_LEADERBOARD)
      expect(invalidateMock).toHaveBeenCalledWith(CACHE_NAMES.STATS)
    })

    it('invalidates cache when status=in_progress', async () => {
      client.__response.data = { id: VALID_UUID }

      const { default: handler } = await import('~~/server/api/games/[id].put')
      await handler(createMockEvent({
        params: { id: VALID_UUID },
        body: { status: 'in_progress' },
      }))

      expect(invalidateMock).toHaveBeenCalled()
    })

    it('invalidates cache when winner is set', async () => {
      client.__response.data = { id: VALID_UUID }

      const { default: handler } = await import('~~/server/api/games/[id].put')
      await handler(createMockEvent({
        params: { id: VALID_UUID },
        body: { winner: 'good' },
      }))

      expect(invalidateMock).toHaveBeenCalled()
    })

    it('does NOT invalidate cache for non-relevant updates', async () => {
      client.__response.data = { id: VALID_UUID }

      const { default: handler } = await import('~~/server/api/games/[id].put')
      await handler(createMockEvent({
        params: { id: VALID_UUID },
        body: { notes: 'some notes' },
      }))

      expect(invalidateMock).not.toHaveBeenCalled()
    })

    it('returns 400 with generic message on DB error', async () => {
      client.__response.error = { message: 'constraint violated' }

      const { default: handler } = await import('~~/server/api/games/[id].put')
      await expectHttpError(
        () => handler(createMockEvent({ params: { id: VALID_UUID }, body: {} })),
        400,
        'Не вдалося оновити гру',
      )
    })
  })
})
