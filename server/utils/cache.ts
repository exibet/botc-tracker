export const CACHE_NAMES = {
  STATS: 'stats',
  ROLES: 'roles',
  PLAYERS_LEADERBOARD: 'players-leaderboard',
} as const

const ONE_DAY = 86400

export const CACHE_TTL = {
  STATS: ONE_DAY,
  ROLES: ONE_DAY,
  PLAYERS_LEADERBOARD: ONE_DAY,
} as const

export async function invalidateCache(name: string) {
  const cache = useStorage('cache')
  const keys = await cache.getKeys(`nitro:handlers:${name}`)
  for (const key of keys) {
    await cache.removeItem(key)
  }
}
