import { describe, expect, it, vi } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

const mockNavigateTo = vi.hoisted(() => vi.fn())

let mockIsAuthenticatedValue = false
let mockIsAdminValue = false

mockNuxtImport('navigateTo', () => mockNavigateTo)
mockNuxtImport('useAuth', () => () => ({
  isAuthenticated: { get value() { return mockIsAuthenticatedValue } },
  isAdmin: { get value() { return mockIsAdminValue } },
}))

describe('admin middleware', () => {
  it('redirects to / when no user', async () => {
    mockIsAuthenticatedValue = false
    mockNavigateTo.mockClear()
    const { default: middleware } = await import('~/middleware/admin')
    await middleware({} as never, {} as never)
    expect(mockNavigateTo).toHaveBeenCalledWith('/')
  })

  it('redirects to / when user is not admin', async () => {
    mockIsAuthenticatedValue = true
    mockIsAdminValue = false
    mockNavigateTo.mockClear()
    const { default: middleware } = await import('~/middleware/admin')
    await middleware({} as never, {} as never)
    expect(mockNavigateTo).toHaveBeenCalledWith('/')
  })

  it('allows access when user is admin', async () => {
    mockIsAuthenticatedValue = true
    mockIsAdminValue = true
    mockNavigateTo.mockClear()
    const { default: middleware } = await import('~/middleware/admin')
    await middleware({} as never, {} as never)
    expect(mockNavigateTo).not.toHaveBeenCalled()
  })
})
