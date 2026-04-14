import { describe, expect, it, vi } from 'vitest'
import { CACHE_NAMES, CACHE_TTL, invalidateCache } from '~~/server/utils/cache'

describe('CACHE_NAMES', () => {
  it('exposes STATS, ROLES, PLAYERS_LEADERBOARD', () => {
    expect(CACHE_NAMES.STATS).toBe('stats')
    expect(CACHE_NAMES.ROLES).toBe('roles')
    expect(CACHE_NAMES.PLAYERS_LEADERBOARD).toBe('players-leaderboard')
  })
})

describe('CACHE_TTL', () => {
  it('all TTLs are 1 day (86400 seconds)', () => {
    expect(CACHE_TTL.STATS).toBe(86400)
    expect(CACHE_TTL.ROLES).toBe(86400)
    expect(CACHE_TTL.PLAYERS_LEADERBOARD).toBe(86400)
  })
})

describe('invalidateCache', () => {
  it('removes all keys matching the name prefix', async () => {
    const removeItem = vi.fn(async () => {})
    const getKeys = vi.fn(async () => [
      'nitro:handlers:players-leaderboard:abc.json',
      'nitro:handlers:players-leaderboard:def.json',
    ])
    vi.stubGlobal('useStorage', () => ({ getKeys, removeItem }))

    await invalidateCache('players-leaderboard')

    expect(getKeys).toHaveBeenCalledWith('nitro:handlers:players-leaderboard')
    expect(removeItem).toHaveBeenCalledTimes(2)
    expect(removeItem).toHaveBeenCalledWith('nitro:handlers:players-leaderboard:abc.json')
    expect(removeItem).toHaveBeenCalledWith('nitro:handlers:players-leaderboard:def.json')
  })

  it('no-ops when no keys match', async () => {
    const removeItem = vi.fn(async () => {})
    vi.stubGlobal('useStorage', () => ({
      getKeys: vi.fn(async () => []),
      removeItem,
    }))

    await invalidateCache('nonexistent')
    expect(removeItem).not.toHaveBeenCalled()
  })
})
