import { describe, expect, it, vi } from 'vitest'
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import GamePlayersTable
  from '~/components/games/GamePlayersTable.vue'

mockNuxtImport('useAuth', () => () => ({
  isAuthenticated: computed(() => false),
  isAdmin: computed(() => false),
  profile: ref(null),
  loading: ref(false),
  signInWithGoogle: vi.fn(),
  signOut: vi.fn(),
  setProfile: vi.fn(),
  loadProfile: vi.fn(),
  clearProfile: vi.fn(),
}))

const mockPlayers = [
  {
    id: 'gp-1',
    game_id: 'game-1',
    player_id: 'user-1',
    starting_role_id: 'empath',
    ending_role_id: null,
    alignment_start: 'good',
    alignment_end: null,
    is_alive: true,
    is_mvp: true,
    added_by: 'user-1',
    created_at: '2026-04-01T00:00:00Z',
    player: {
      id: 'user-1',
      nickname: 'Гравець1',
      avatar_url: null,
    },
    starting_role: {
      id: 'empath',
      name_ua: 'Емпат',
      name_en: 'Empath',
      image_url: null,
      type: 'townsfolk',
    },
    ending_role: null,
  },
  {
    id: 'gp-2',
    game_id: 'game-1',
    player_id: 'user-2',
    starting_role_id: 'imp',
    ending_role_id: null,
    alignment_start: 'evil',
    alignment_end: null,
    is_alive: false,
    is_mvp: false,
    added_by: 'user-1',
    created_at: '2026-04-01T00:00:00Z',
    player: {
      id: 'user-2',
      nickname: 'Гравець2',
      avatar_url: null,
    },
    starting_role: {
      id: 'imp',
      name_ua: 'Імп',
      name_en: 'Imp',
      image_url: null,
      type: 'demon',
    },
    ending_role: null,
  },
]

describe('gamePlayersTable', () => {
  it('renders all player rows', async () => {
    const wrapper = await mountSuspended(GamePlayersTable, {
      props: { players: mockPlayers },
    })
    // Desktop table + mobile cards = 2 rows per player
    const rows = wrapper.findAll('[data-testid="player-row"]')
    expect(rows.length).toBeGreaterThanOrEqual(2)
  })

  it('renders player nicknames', async () => {
    const wrapper = await mountSuspended(GamePlayersTable, {
      props: { players: mockPlayers },
    })
    expect(wrapper.text()).toContain('Гравець1')
    expect(wrapper.text()).toContain('Гравець2')
  })

  it('renders role names in Ukrainian', async () => {
    const wrapper = await mountSuspended(GamePlayersTable, {
      props: { players: mockPlayers },
    })
    expect(wrapper.text()).toContain('Емпат')
    expect(wrapper.text()).toContain('Імп')
  })

  it('shows MVP badge for MVP player', async () => {
    const wrapper = await mountSuspended(GamePlayersTable, {
      props: { players: mockPlayers },
    })
    const badges = wrapper.findAll('[data-testid="mvp-badge"]')
    // Desktop + mobile layouts both show MVP badge
    expect(badges.length).toBeGreaterThanOrEqual(1)
  })

  it('shows alive/dead status', async () => {
    const wrapper = await mountSuspended(GamePlayersTable, {
      props: { players: mockPlayers },
    })
    expect(wrapper.text()).toContain('Живий')
    expect(wrapper.text()).toContain('Мертвий')
  })

  it('shows empty state when no players', async () => {
    const wrapper = await mountSuspended(GamePlayersTable, {
      props: { players: [] },
    })
    expect(wrapper.text()).toContain('Немає гравців')
  })
})
