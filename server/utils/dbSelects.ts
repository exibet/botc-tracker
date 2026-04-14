/**
 * Centralized Supabase `.select()` projections.
 *
 * Single source of truth for the shape returned by server endpoints.
 * Any field-level change propagates through every consumer at once.
 */

// ──────────────────────────────────────────────────────────
// profiles
// ──────────────────────────────────────────────────────────

/** Profile identity fields including registration timestamp. */
export const PROFILE_SELECT
  = 'id, nickname, avatar_url, role, is_manual, created_at'

// ──────────────────────────────────────────────────────────
// games
// ──────────────────────────────────────────────────────────

/** Full game shape used by list + detail + home endpoints. */
export const GAME_WITH_DETAILS_SELECT = `
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

// ──────────────────────────────────────────────────────────
// game_players
// ──────────────────────────────────────────────────────────

/**
 * Single game_player row with joined player + both role objects.
 * Used by mutation endpoints that return the updated record for the
 * client to reconcile local state.
 */
export const GAME_PLAYER_WITH_ROLES_SELECT = `
  *,
  player:profiles!player_id(id, nickname, avatar_url),
  starting_role:roles!starting_role_id(id, name_ua, name_en, image_url, type),
  ending_role:roles!ending_role_id(id, name_ua, name_en, image_url, type)
`
