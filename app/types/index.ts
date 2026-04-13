import type { Tables } from '~/types/database.types'
import type {
  ALIGNMENTS,
  EDITIONS,
  GAME_STATUSES,
  ROLE_TYPES,
  SCRIPTS,
  USER_ROLES,
  WINNERS,
} from '#shared/constants'

// --- Domain aliases (derived from shared constants) ---
export type RoleType = typeof ROLE_TYPES[number]
export type Edition = typeof EDITIONS[number]
export type Script = typeof SCRIPTS[number]
export type Alignment = typeof ALIGNMENTS[number]
export type Winner = typeof WINNERS[number]
export type GameStatus = typeof GAME_STATUSES[number]
export type UserRole = typeof USER_ROLES[number]

// --- DB row types with domain narrowing ---
export type RoleRow = Tables<'roles'>
export type ProfileRow = Tables<'profiles'>
export type GameRow = Tables<'games'>
export type GamePlayerRow = Tables<'game_players'>
export type MvpVoteRow = Tables<'mvp_votes'>

export interface Role extends Omit<RoleRow, 'type' | 'edition' | 'meta'> {
  type: RoleType
  edition: Edition
  meta: Record<string, unknown> | null
}

export interface Profile extends Omit<ProfileRow, 'role' | 'created_at'> {
  role: UserRole
  created_at: string
}

export interface Game extends Omit<GameRow, 'script' | 'status' | 'winner' | 'created_at'> {
  script: Script
  status: GameStatus
  winner: Winner | null
  created_at: string
}

export interface GamePlayer extends Omit<GamePlayerRow, 'alignment_start' | 'alignment_end' | 'created_at'> {
  alignment_start: Alignment | null
  alignment_end: Alignment | null
  created_at: string
}

export interface MvpVote extends Omit<MvpVoteRow, 'created_at'> {
  created_at: string
}

// Light game_player data from GAME_LIST_SELECT (for cards)
export interface GamePlayerLight {
  is_mvp: boolean
  starting_role: { type: string } | null
  player: { id: string, nickname: string, avatar_url: string | null } | null
}

// Full game_player data from GAME_DETAIL_SELECT (for editing, role IDs resolved from global roles)
export interface GamePlayerInline {
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
  player: { id: string, nickname: string, avatar_url: string | null }
}

export interface GameWithDetails extends Game {
  storyteller: { id: string, nickname: string } | null
  created_by_profile: { id: string, nickname: string }
  mvp_player: { id: string, nickname: string, avatar_url: string | null } | null
  game_players?: (GamePlayerLight | GamePlayerInline)[]
  mvp_votes?: MvpVote[]
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
