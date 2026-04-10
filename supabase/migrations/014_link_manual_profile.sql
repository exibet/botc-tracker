-- Helper: transfer all game history from one profile to another.
-- Handles conflicts (duplicate game entries, self-votes).
-- Internal use only — called by link/unlink functions.

CREATE OR REPLACE FUNCTION transfer_player_history(
  from_id UUID,
  to_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete game_players that would conflict (same game)
  DELETE FROM game_players
    WHERE player_id = from_id
      AND game_id IN (
        SELECT game_id FROM game_players
        WHERE player_id = to_id
      );

  -- Transfer game_players
  UPDATE game_players SET player_id = to_id
    WHERE player_id = from_id;
  UPDATE game_players SET added_by = to_id
    WHERE added_by = from_id;

  -- Transfer games references
  UPDATE games SET storyteller_id = to_id
    WHERE storyteller_id = from_id;
  UPDATE games SET created_by = to_id
    WHERE created_by = from_id;
  UPDATE games SET mvp_player_id = to_id
    WHERE mvp_player_id = from_id;

  -- Delete votes that would become self-votes
  DELETE FROM mvp_votes
    WHERE (voter_id = from_id AND candidate_id = to_id)
       OR (voter_id = to_id AND candidate_id = from_id);

  -- Delete duplicate voter per game conflicts
  DELETE FROM mvp_votes
    WHERE voter_id = from_id
      AND game_id IN (
        SELECT game_id FROM mvp_votes
        WHERE voter_id = to_id
      );

  -- Transfer remaining mvp_votes
  UPDATE mvp_votes SET voter_id = to_id
    WHERE voter_id = from_id;
  UPDATE mvp_votes SET candidate_id = to_id
    WHERE candidate_id = from_id;
END;
$$;

-- RPC function: link a manual profile to a real auth user.
-- Transfers all game history, then deletes the manual profile.
-- Only callable by admin.

CREATE OR REPLACE FUNCTION link_manual_profile(
  manual_id UUID,
  auth_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  _caller_role TEXT;
  _is_manual BOOLEAN;
  _auth_exists BOOLEAN;
BEGIN
  -- Verify caller is admin
  SELECT role INTO _caller_role
    FROM profiles WHERE id = auth.uid();
  IF _caller_role IS DISTINCT FROM 'admin' THEN
    RAISE EXCEPTION 'Only admin can link profiles';
  END IF;

  -- Verify manual profile exists and is manual
  SELECT is_manual INTO _is_manual
    FROM profiles WHERE id = manual_id;
  IF _is_manual IS NULL THEN
    RAISE EXCEPTION 'Manual profile not found';
  END IF;
  IF NOT _is_manual THEN
    RAISE EXCEPTION 'Profile is not a manual profile';
  END IF;

  -- Verify auth profile exists and is not manual
  SELECT NOT is_manual INTO _auth_exists
    FROM profiles WHERE id = auth_id;
  IF _auth_exists IS NULL OR NOT _auth_exists THEN
    RAISE EXCEPTION 'Auth profile not found or is manual';
  END IF;

  PERFORM transfer_player_history(manual_id, auth_id);

  -- Delete manual profile
  DELETE FROM profiles WHERE id = manual_id;
END;
$$;
