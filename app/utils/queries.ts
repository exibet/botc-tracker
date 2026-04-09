export const GAME_SELECT = `
  *,
  storyteller:profiles!storyteller_id(id, nickname),
  created_by_profile:profiles!created_by(id, nickname),
  game_players(
    is_mvp,
    starting_role:roles!starting_role_id(type),
    player:profiles!player_id(id, nickname, avatar_url)
  )
`
