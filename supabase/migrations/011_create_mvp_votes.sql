-- ============================================
-- MVP Votes table + RLS + auto-sync trigger
-- ============================================

CREATE TABLE IF NOT EXISTS mvp_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  voter_id UUID NOT NULL REFERENCES profiles(id),
  candidate_id UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(game_id, voter_id),
  CHECK (voter_id != candidate_id)
);

CREATE INDEX idx_mvp_votes_game ON mvp_votes(game_id);
CREATE INDEX idx_mvp_votes_candidate ON mvp_votes(game_id, candidate_id);

-- ============================================
-- RLS Policies
-- ============================================
ALTER TABLE mvp_votes ENABLE ROW LEVEL SECURITY;

-- Everyone can see votes
CREATE POLICY "mvp_votes_select" ON mvp_votes
  FOR SELECT USING (true);

-- Players can vote if they participated in the game
-- and candidate is also a participant
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
  );

-- Players can update their own vote
CREATE POLICY "mvp_votes_player_update" ON mvp_votes
  FOR UPDATE USING (voter_id = auth.uid());

-- Players can delete their own vote
CREATE POLICY "mvp_votes_player_delete" ON mvp_votes
  FOR DELETE USING (voter_id = auth.uid());

-- Admin can do everything
CREATE POLICY "mvp_votes_admin_insert" ON mvp_votes
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "mvp_votes_admin_update" ON mvp_votes
  FOR UPDATE USING (is_admin());

CREATE POLICY "mvp_votes_admin_delete" ON mvp_votes
  FOR DELETE USING (is_admin());

-- Trigger is created in 012_games_mvp_player.sql
