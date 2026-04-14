import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.stubGlobal('defineEventHandler', (fn: unknown) => fn)

describe('server/middleware/auth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('attaches lazy getProfile() to event.context', async () => {
    const profileFetcher = vi.fn(async () => ({ id: 'user-1', role: 'player' }))
    vi.stubGlobal('getProfile', profileFetcher)

    const { default: middleware } = await import('~~/server/middleware/auth')
    const event = { context: {} as Record<string, unknown> }
    middleware(event as never)

    expect(typeof event.context.getProfile).toBe('function')
    expect(profileFetcher).not.toHaveBeenCalled()

    const result = await (event.context.getProfile as () => Promise<unknown>)()
    expect(result).toEqual({ id: 'user-1', role: 'player' })
    expect(profileFetcher).toHaveBeenCalledTimes(1)
  })

  it('caches profile fetch — single DB call across multiple invocations', async () => {
    const profileFetcher = vi.fn(async () => ({ id: 'user-1', role: 'player' }))
    vi.stubGlobal('getProfile', profileFetcher)

    const { default: middleware } = await import('~~/server/middleware/auth')
    const event = { context: {} as Record<string, unknown> }
    middleware(event as never)

    const get = event.context.getProfile as () => Promise<unknown>
    await get()
    await get()
    await get()

    expect(profileFetcher).toHaveBeenCalledTimes(1)
  })
})
