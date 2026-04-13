export const API = {
  // Games
  GAMES: '/api/games',
  GAME: (id: string) => `/api/games/${id}` as const,

  // Home
  HOME: '/api/home',

  // Players
  PLAYERS: '/api/players',
  PLAYERS_LIST: '/api/players/list',
  PLAYER: (id: string) => `/api/players/${id}` as const,
  PLAYER_RECENT: (id: string) => `/api/players/${id}/recent` as const,
  PLAYER_MANUAL: '/api/players/manual',
  PLAYER_LINK: '/api/players/link',
  PLAYER_UNLINK: '/api/players/unlink',

  // Game players
  GAME_PLAYERS: '/api/game-players',
  GAME_PLAYER: (id: string) => `/api/game-players/${id}` as const,

  // Votes
  VOTES: '/api/votes',

  // Static / cached
  ROLES: '/api/roles',
  STATS: '/api/stats',

  // Auth
  AUTH_PROFILE: '/api/auth/profile',
} as const
