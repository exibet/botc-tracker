import { describe, expect, it } from 'vitest'
import { API } from '#shared/api'

describe('API path constants', () => {
  it('defines static paths', () => {
    expect(API.GAMES).toBe('/api/games')
    expect(API.HOME).toBe('/api/home')
    expect(API.PLAYERS).toBe('/api/players')
    expect(API.PLAYERS_LIST).toBe('/api/players/list')
    expect(API.GAME_PLAYERS).toBe('/api/game-players')
    expect(API.VOTES).toBe('/api/votes')
    expect(API.ROLES).toBe('/api/roles')
    expect(API.STATS).toBe('/api/stats')
    expect(API.AUTH_PROFILE).toBe('/api/auth/profile')
  })

  it('defines dynamic path functions', () => {
    expect(API.GAME('abc-123')).toBe('/api/games/abc-123')
    expect(API.PLAYER('user-1')).toBe('/api/players/user-1')
    expect(API.PLAYER_RECENT('user-1')).toBe('/api/players/user-1/recent')
    expect(API.GAME_PLAYER('gp-1')).toBe('/api/game-players/gp-1')
  })
})
