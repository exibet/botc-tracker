import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import AppHeader from '~/components/layout/AppHeader.vue'

const state = {
  isAuthenticated: false,
  isAdmin: false,
  nickname: '',
  avatarUrl: null as string | null,
  role: 'player' as string,
}

mockNuxtImport('useAuth', () => () => ({
  isAuthenticated: computed(() => state.isAuthenticated),
  isAdmin: computed(() => state.isAdmin),
  profile: computed(() =>
    state.isAuthenticated
      ? {
          nickname: state.nickname,
          avatar_url: state.avatarUrl,
          role: state.role,
        }
      : null),
  loading: ref(false),
  profileReady: ref(true),
  signInWithGoogle: vi.fn(),
  signOut: vi.fn(),
  loadProfile: vi.fn(),
  clearProfile: vi.fn(),
}))

describe('appHeader', () => {
  beforeEach(() => {
    state.isAuthenticated = false
    state.isAdmin = false
    state.nickname = ''
    state.avatarUrl = null
    state.role = 'player'
  })

  it('renders the brand name', async () => {
    const wrapper = await mountSuspended(AppHeader)
    expect(wrapper.text()).toContain('BotC Tracker')
  })

  it('renders navigation links', async () => {
    const wrapper = await mountSuspended(AppHeader)
    const text = wrapper.text()
    expect(text).toContain('Головна')
    expect(text).toContain('Ігри')
    expect(text).toContain('Гравці')
    expect(text).toContain('Лідерборд')
    expect(text).toContain('Ролі')
  })

  it('shows sign-in button for guests', async () => {
    state.isAuthenticated = false
    const wrapper = await mountSuspended(AppHeader)
    const html = wrapper.html()
    expect(html).toContain('Увійти')
    expect(html).toContain('sign-in-btn')
    expect(html).not.toContain('user-avatar')
  })

  it('shows avatar for logged-in user', async () => {
    state.isAuthenticated = true
    state.nickname = 'Test User'
    state.role = 'player'
    const wrapper = await mountSuspended(AppHeader)
    const html = wrapper.html()
    expect(html).not.toContain('sign-in-btn')
    expect(html).toContain('user-avatar')
  })

  it('shows admin badge for admin user', async () => {
    state.isAuthenticated = true
    state.isAdmin = true
    state.nickname = 'Admin'
    state.role = 'admin'
    const wrapper = await mountSuspended(AppHeader)
    expect(wrapper.html()).toContain('admin-badge')
  })

  it('hides admin badge for regular player', async () => {
    state.isAuthenticated = true
    state.isAdmin = false
    state.nickname = 'Player'
    state.role = 'player'
    const wrapper = await mountSuspended(AppHeader)
    expect(wrapper.html()).not.toContain('admin-badge')
  })
})
