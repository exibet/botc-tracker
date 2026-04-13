-- Fix: sync_mvp_from_votes crashes when game is being deleted.
-- CASCADE delete on games -> mvp_votes fires this trigger,
-- which then tries to UPDATE the games row that is already being deleted.
-- Solution: skip the UPDATE if the game row is gone (being deleted).

CREATE OR REPLACE FUNCTION sync_mvp_from_votes()
RETURNS TRIGGER AS $$
DECLARE
  target_game_id UUID;
  winner_player_id UUID;
  top_count INT;
  num_with_top INT;
  total_players INT;
  total_voters INT;
  game_exists BOOLEAN;
BEGIN
  target_game_id := COALESCE(NEW.game_id, OLD.game_id);

  -- If the game is being deleted (CASCADE), skip entirely
  SELECT EXISTS (
    SELECT 1 FROM games WHERE id = target_game_id
  ) INTO game_exists;

  IF NOT game_exists THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  -- Check if at least 50% of players voted
  SELECT COUNT(*) INTO total_players
  FROM game_players
  WHERE game_id = target_game_id;

  SELECT COUNT(DISTINCT voter_id) INTO total_voters
  FROM mvp_votes
  WHERE game_id = target_game_id;

  IF total_voters * 2 >= total_players THEN
    -- Find max vote count
    SELECT COUNT(*) INTO top_count
    FROM mvp_votes
    WHERE game_id = target_game_id
    GROUP BY candidate_id
    ORDER BY COUNT(*) DESC
    LIMIT 1;

    -- How many candidates share that top count
    SELECT COUNT(*) INTO num_with_top
    FROM (
      SELECT candidate_id
      FROM mvp_votes
      WHERE game_id = target_game_id
      GROUP BY candidate_id
      HAVING COUNT(*) = top_count
    ) t;

    -- Only set MVP if exactly one candidate leads
    IF num_with_top = 1 THEN
      SELECT candidate_id INTO winner_player_id
      FROM mvp_votes
      WHERE game_id = target_game_id
      GROUP BY candidate_id
      ORDER BY COUNT(*) DESC
      LIMIT 1;
    END IF;
  END IF;

  -- Clear all MVP flags for this game
  UPDATE game_players SET is_mvp = false
  WHERE game_id = target_game_id AND is_mvp = true;

  -- Update both game_players.is_mvp and games.mvp_player_id
  IF winner_player_id IS NOT NULL THEN
    UPDATE game_players SET is_mvp = true
    WHERE game_id = target_game_id
      AND player_id = winner_player_id;
  END IF;

  UPDATE games SET mvp_player_id = winner_player_id
  WHERE id = target_game_id;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
