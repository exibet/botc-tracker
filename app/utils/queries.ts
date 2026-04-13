// Full select for active games — includes all game_player fields and votes
// Used by useGamePlayers (Phase 5 will move this to server)
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
  ),
  mvp_votes(id, game_id, voter_id, candidate_id, created_at)
`
