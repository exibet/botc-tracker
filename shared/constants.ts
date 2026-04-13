export const SCRIPTS = [
  'trouble_brewing',
  'bad_moon_rising',
  'sects_and_violets',
  'custom',
] as const

export const ALIGNMENTS = ['good', 'evil'] as const

export const WINNERS = ['good', 'evil'] as const

export const GAME_STATUSES = ['upcoming', 'in_progress', 'finished'] as const

export const USER_ROLES = ['player', 'admin'] as const

export const ROLE_TYPES = [
  'townsfolk',
  'outsider',
  'minion',
  'demon',
  'traveller',
  'fabled',
] as const

export const AUTH_EVENTS = {
  SIGNED_IN: 'SIGNED_IN',
  SIGNED_OUT: 'SIGNED_OUT',
  TOKEN_REFRESHED: 'TOKEN_REFRESHED',
  INITIAL_SESSION: 'INITIAL_SESSION',
} as const

export const EDITIONS = [
  'tb',
  'bmr',
  'snv',
  'experimental',
  'ks',
  'base3',
] as const
