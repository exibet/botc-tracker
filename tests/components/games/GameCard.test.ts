import { describe, expect, it, vi } from 'vitest'
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import GameCard from '~/components/games/GameCard.vue'

mockNuxtImport('useAuth', () => () => ({
  isAuthenticated: computed(() => false),
  isAdmin: computed(() => false),
  profile: ref(null),
  loading: ref(false),
  profileReady: ref(true),
  signInWithGoogle: vi.fn(),
  signOut: vi.fn(),
  loadProfile: vi.fn(),
  clearProfile: vi.fn(),
}))

const baseGame = {
  id: 'game-1',
  date: '2026-04-01',
  script: 'trouble_brewing' as const,
  custom_script_name: null,
  winner: 'good' as const,
  storyteller_id: 'user-1',
  storyteller: { id: 'user-1', nickname: 'Оповідач' },
  created_by: 'user-1',
  created_by_profile: { id: 'user-1', nickname: 'Admin' },
  notes: null,
  player_count: 8,
  created_at: '2026-04-01T00:00:00Z',
}

describe('gameCard', () => {
  it('renders winner badge', async () => {
    const wrapper = await mountSuspended(GameCard, {
      props: { game: baseGame },
    })
    expect(wrapper.text()).toContain('Добро')
  })

  it('renders script label in Ukrainian', async () => {
    const wrapper = await mountSuspended(GameCard, {
      props: { game: baseGame },
    })
    expect(wrapper.text()).toContain('Неприємності в місті')
  })

  it('renders player count', async () => {
    const wrapper = await mountSuspended(GameCard, {
      props: { game: baseGame },
    })
    expect(wrapper.text()).toContain('8')
  })

  it('renders storyteller name', async () => {
    const wrapper = await mountSuspended(GameCard, {
      props: { game: baseGame },
    })
    expect(wrapper.text()).toContain('Оповідач')
  })

  it('links to game detail page', async () => {
    const wrapper = await mountSuspended(GameCard, {
      props: { game: baseGame },
    })
    const link = wrapper.find('[data-testid="game-card"]')
    expect(link.attributes('href')).toBe('/games/game-1')
  })

  it('hides storyteller when null', async () => {
    const game = { ...baseGame, storyteller: null }
    const wrapper = await mountSuspended(GameCard, {
      props: { game },
    })
    expect(wrapper.text()).not.toContain('Оповідач')
  })
})
