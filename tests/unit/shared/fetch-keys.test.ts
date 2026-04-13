import { describe, expect, it } from 'vitest'
import { FETCH_KEY } from '#shared/fetch-keys'

describe('FETCH_KEY constants', () => {
  it('defines static keys', () => {
    expect(FETCH_KEY.HOME).toBe('home')
    expect(FETCH_KEY.GAMES).toBe('games')
    expect(FETCH_KEY.PLAYERS_LIST).toBe('players-list')
    expect(FETCH_KEY.PLAYERS_LEADERBOARD).toBe('players-leaderboard')
    expect(FETCH_KEY.ROLES).toBe('roles')
    expect(FETCH_KEY.STATS).toBe('game-stats')
  })

  it('defines dynamic key functions', () => {
    expect(FETCH_KEY.GAME('abc')).toBe('game-abc')
    expect(FETCH_KEY.PLAYER('user-1')).toBe('player-user-1')
    expect(FETCH_KEY.PLAYER_RECENT('user-1')).toBe('player-user-1-recent')
  })
})
