// Fields to select from profiles table
export const PROFILE_SELECT = 'id, nickname, avatar_url, role, is_manual, created_at'

// Light select for game lists (cards) — no nested game_players details
export const GAME_LIST_SELECT = `
  *,
  storyteller:profiles!storyteller_id(id, nickname),
  created_by_profile:profiles!created_by(id, nickname),
  mvp_player:profiles!mvp_player_id(id, nickname, avatar_url),
  game_players(
    is_mvp,
    starting_role:roles!starting_role_id(type),
    player:profiles!player_id(id, nickname, avatar_url)
  )
`

// Full select for active games — includes all game_player fields for inline editing
export const GAME_DETAIL_SELECT = `
  *,
  storyteller:profiles!storyteller_id(id, nickname),
  created_by_profile:profiles!created_by(id, nickname),
  mvp_player:profiles!mvp_player_id(id, nickname, avatar_url),
  game_players(
    id, game_id, player_id,
    starting_role_id, ending_role_id,
    alignment_start, alignment_end,
    is_alive, is_mvp, added_by, created_at,
    player:profiles!player_id(id, nickname, avatar_url)
  )
`
