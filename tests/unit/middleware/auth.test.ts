import { describe, expect, it, vi } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

const mockNavigateTo = vi.hoisted(() => vi.fn())

let mockIsAuthenticatedValue = false

mockNuxtImport('navigateTo', () => mockNavigateTo)
mockNuxtImport('useAuth', () => () => ({
  isAuthenticated: { get value() { return mockIsAuthenticatedValue } },
  waitForProfile: () => Promise.resolve(),
}))

describe('auth middleware', () => {
  it('redirects to / when no user', async () => {
    mockIsAuthenticatedValue = false
    const { default: middleware } = await import('~/middleware/auth')
    await middleware({} as never, {} as never)
    expect(mockNavigateTo).toHaveBeenCalledWith('/')
  })

  it('allows access when user exists', async () => {
    mockIsAuthenticatedValue = true
    mockNavigateTo.mockClear()
    const { default: middleware } = await import('~/middleware/auth')
    await middleware({} as never, {} as never)
    expect(mockNavigateTo).not.toHaveBeenCalled()
  })
})
