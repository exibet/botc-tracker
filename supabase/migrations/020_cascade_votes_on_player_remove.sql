-- When a player is removed from a game, delete their votes
-- (both as voter and as candidate) for that game.
CREATE OR REPLACE FUNCTION delete_votes_on_player_remove()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM mvp_votes
    WHERE game_id = OLD.game_id
      AND (voter_id = OLD.player_id OR candidate_id = OLD.player_id);
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER tr_delete_votes_on_player_remove
  BEFORE DELETE ON game_players
  FOR EACH ROW EXECUTE FUNCTION delete_votes_on_player_remove();
