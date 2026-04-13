export const FETCH_KEY = {
  HOME: 'home',
  GAMES: 'games',
  GAME: (id: string) => `game-${id}`,
  PLAYERS_LIST: 'players-list',
  PLAYERS_LEADERBOARD: 'players-leaderboard',
  PLAYER: (id: string) => `player-${id}`,
  PLAYER_RECENT: (id: string) => `player-${id}-recent`,
  ROLES: 'roles',
  STATS: 'game-stats',
} as const
