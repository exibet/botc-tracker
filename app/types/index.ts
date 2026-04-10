export type RoleType
  = | 'townsfolk'
    | 'outsider'
    | 'minion'
    | 'demon'
    | 'traveller'
    | 'fabled'

export type Edition
  = | 'tb'
    | 'bmr'
    | 'snv'
    | 'experimental'
    | 'ks'
    | 'base3'

export type Script
  = | 'trouble_brewing'
    | 'bad_moon_rising'
    | 'sects_and_violets'
    | 'custom'

export type Alignment = 'good' | 'evil'
export type Winner = 'good' | 'evil'
export type GameStatus = 'upcoming' | 'in_progress' | 'finished'
export type UserRole = 'player' | 'admin'

export interface Role {
  id: string
  name_en: string
  name_ua: string
  description_en: string
  description_ua: string
  type: RoleType
  edition: Edition
  image_url: string | null
  meta: Record<string, unknown> | null
  created_at: string
}

export interface Profile {
  id: string
  nickname: string
  avatar_url: string | null
  role: UserRole
  is_manual: boolean
  created_at: string
}

export interface Game {
  id: string
  date: string
  script: Script
  custom_script_name: string | null
  status: GameStatus
  winner: Winner | null
  storyteller_id: string | null
  mvp_player_id: string | null
  notes: string | null
  player_count: number | null
  created_by: string
  created_at: string
}

export interface GamePlayer {
  id: string
  game_id: string
  player_id: string
  starting_role_id: string | null
  ending_role_id: string | null
  alignment_start: Alignment | null
  alignment_end: Alignment | null
  is_alive: boolean | null
  is_mvp: boolean
  added_by: string
  created_at: string
}

export interface MvpVote {
  id: string
  game_id: string
  voter_id: string
  candidate_id: string
  created_at: string
}

export interface GameWithDetails extends Game {
  storyteller: { id: string, nickname: string } | null
  created_by_profile: { id: string, nickname: string }
  mvp_player: { id: string, nickname: string, avatar_url: string | null } | null
  game_players?: {
    is_mvp: boolean
    starting_role: { type: string } | null
    player: { id: string, nickname: string, avatar_url: string | null } | null
  }[]
}

export interface PlayerEntry {
  player_id: string
  nickname: string
  starting_role_id: string
  role_name: string
  alignment_start: Alignment
  ending_role_id: string | null
  ending_role_name: string | null
  alignment_end: Alignment | null
  is_alive: boolean | null
  is_mvp: boolean
}

export interface PlayerStats {
  totalGames: number
  wins: number
  losses: number
  winRate: number
  mvpCount: number
  survivalRate: number
  goodGames: number
  goodWins: number
  goodWinRate: number
  evilGames: number
  evilWins: number
  evilWinRate: number
  points: number
  roleDistribution: Record<RoleType, number>
}

export interface RolePlayCount {
  roleName: string
  roleNameEn: string
  roleType: RoleType
  roleImageUrl: string | null
  count: number
}

export interface PlayerGameHistory {
  gameId: string
  date: string
  script: Script
  roleName: string
  roleNameEn: string
  roleType: RoleType
  roleImageUrl: string | null
  alignment: Alignment | null
  isAlive: boolean | null
  isMvp: boolean
  winner: Winner | null
  won: boolean | null
  // Starting role data
  startingRoleName: string | null
  startingRoleNameEn: string | null
  startingRoleImageUrl: string | null
  startingRoleType: RoleType | null
  // Ending role data (if changed)
  endingRoleName: string | null
  endingRoleNameEn: string | null
  endingRoleImageUrl: string | null
  endingRoleType: RoleType | null
  // Alignment timeline
  alignmentStart: Alignment | null
  alignmentEnd: Alignment | null
  // Whether changes happened
  hasRoleChange: boolean
  hasAlignmentChange: boolean
}

export interface PlayerWithStats extends Profile {
  gamesPlayed: number
  wins: number
  losses: number
  winRate: number
  mvpCount: number
  goodGames: number
  evilGames: number
  points: number
  winStreak: number
}
