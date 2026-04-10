-- RPC function: unlink an auth profile back to a manual profile.
-- Creates a new manual profile with the given nickname,
-- transfers all game history to it, leaving the auth profile clean.
-- Only callable by admin.

CREATE OR REPLACE FUNCTION unlink_profile(
  auth_id UUID,
  manual_nickname TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  _caller_role TEXT;
  _is_manual BOOLEAN;
  _new_id UUID;
BEGIN
  -- Verify caller is admin
  SELECT role INTO _caller_role
    FROM profiles WHERE id = auth.uid();
  IF _caller_role IS DISTINCT FROM 'admin' THEN
    RAISE EXCEPTION 'Only admin can unlink profiles';
  END IF;

  -- Verify source profile exists and is NOT manual
  SELECT is_manual INTO _is_manual
    FROM profiles WHERE id = auth_id;
  IF _is_manual IS NULL THEN
    RAISE EXCEPTION 'Profile not found';
  END IF;
  IF _is_manual THEN
    RAISE EXCEPTION 'Profile is already manual';
  END IF;

  -- Create new manual profile
  _new_id := gen_random_uuid();
  INSERT INTO profiles (id, nickname, is_manual)
    VALUES (_new_id, manual_nickname, true);

  PERFORM transfer_player_history(auth_id, _new_id);

  RETURN _new_id;
END;
$$;
