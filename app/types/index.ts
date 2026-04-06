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
  created_at: string
}

export interface Game {
  id: string
  date: string
  script: Script
  custom_script_name: string | null
  winner: Winner
  storyteller_id: string | null
  notes: string | null
  player_count: number | null
  created_by: string
  created_at: string
}

export interface GamePlayer {
  id: string
  game_id: string
  player_id: string
  starting_role_id: string
  ending_role_id: string | null
  alignment_start: Alignment
  alignment_end: Alignment | null
  is_alive: boolean
  is_mvp: boolean
  added_by: string
  created_at: string
}
