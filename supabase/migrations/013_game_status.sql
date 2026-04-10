-- ============================================
-- Add game lifecycle status
-- States: upcoming -> in_progress -> finished
-- ============================================

-- 1. Add status column (existing games default to 'finished')
ALTER TABLE games
  ADD COLUMN status TEXT NOT NULL DEFAULT 'finished';

-- 2. Replace winner check to allow NULL
ALTER TABLE games DROP CONSTRAINT IF EXISTS games_winner_check;
ALTER TABLE games ADD CONSTRAINT games_winner_check
  CHECK (winner IS NULL OR winner IN ('good', 'evil'));

ALTER TABLE games ADD CONSTRAINT games_status_check
  CHECK (status IN ('upcoming', 'in_progress', 'finished'));

-- 3. Make winner nullable
ALTER TABLE games
  ALTER COLUMN winner DROP NOT NULL;

-- 4. Finished games must have a winner
ALTER TABLE games
  ADD CONSTRAINT games_finished_requires_winner
    CHECK (status != 'finished' OR winner IS NOT NULL);

-- 5. Non-finished games should not have a winner
ALTER TABLE games
  ADD CONSTRAINT games_non_finished_no_winner
    CHECK (status = 'finished' OR winner IS NULL);

-- 6. Players can only edit their entry when game is in_progress
DROP POLICY IF EXISTS "gp_player_update_self" ON game_players;
CREATE POLICY "gp_player_update_self" ON game_players
  FOR UPDATE USING (
    player_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM games
      WHERE id = game_players.game_id
        AND status = 'in_progress'
    )
  );

-- 7. Players can join in upcoming or in_progress
DROP POLICY IF EXISTS "gp_player_insert_self" ON game_players;
CREATE POLICY "gp_player_insert_self" ON game_players
  FOR INSERT WITH CHECK (
    player_id = auth.uid()
    AND added_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM games
      WHERE id = game_players.game_id
        AND status IN ('upcoming', 'in_progress')
    )
  );

-- 8. Players can leave in upcoming or in_progress
DROP POLICY IF EXISTS "gp_player_delete_self" ON game_players;
CREATE POLICY "gp_player_delete_self" ON game_players
  FOR DELETE USING (
    player_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM games
      WHERE id = game_players.game_id
        AND status IN ('upcoming', 'in_progress')
    )
  );

-- 9. MVP votes: only when game is in_progress
DROP POLICY IF EXISTS "mvp_votes_player_insert" ON mvp_votes;
CREATE POLICY "mvp_votes_player_insert" ON mvp_votes
  FOR INSERT WITH CHECK (
    voter_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM game_players
      WHERE game_id = mvp_votes.game_id
        AND player_id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM game_players
      WHERE game_id = mvp_votes.game_id
        AND player_id = mvp_votes.candidate_id
    )
    AND EXISTS (
      SELECT 1 FROM games
      WHERE id = mvp_votes.game_id
        AND status = 'in_progress'
    )
  );

DROP POLICY IF EXISTS "mvp_votes_player_update" ON mvp_votes;
CREATE POLICY "mvp_votes_player_update" ON mvp_votes
  FOR UPDATE USING (
    voter_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM games
      WHERE id = mvp_votes.game_id
        AND status = 'in_progress'
    )
  );

DROP POLICY IF EXISTS "mvp_votes_player_delete" ON mvp_votes;
CREATE POLICY "mvp_votes_player_delete" ON mvp_votes
  FOR DELETE USING (
    voter_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM games
      WHERE id = mvp_votes.game_id
        AND status = 'in_progress'
    )
  );

-- 10. Index for status filtering
CREATE INDEX IF NOT EXISTS idx_games_status ON games(status);
