-- Create game_players table for player participation
CREATE TABLE IF NOT EXISTS game_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES profiles(id),
  starting_role_id TEXT NOT NULL REFERENCES roles(id),
  ending_role_id TEXT REFERENCES roles(id),
  alignment_start TEXT NOT NULL CHECK (alignment_start IN ('good', 'evil')),
  alignment_end TEXT CHECK (alignment_end IN ('good', 'evil')),
  is_alive BOOLEAN NOT NULL DEFAULT true,
  is_mvp BOOLEAN NOT NULL DEFAULT false,
  added_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(game_id, player_id)
);

CREATE INDEX IF NOT EXISTS idx_game_players_game ON game_players(game_id);
CREATE INDEX IF NOT EXISTS idx_game_players_player ON game_players(player_id);
CREATE INDEX IF NOT EXISTS idx_game_players_role ON game_players(starting_role_id);
