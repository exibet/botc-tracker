-- Create games table for game sessions
CREATE TABLE IF NOT EXISTS games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  script TEXT NOT NULL CHECK (script IN (
    'trouble_brewing', 'bad_moon_rising', 'sects_and_violets', 'custom'
  )),
  custom_script_name TEXT,
  winner TEXT NOT NULL CHECK (winner IN ('good', 'evil')),
  storyteller_id UUID REFERENCES profiles(id),
  notes TEXT,
  player_count INT,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_games_date ON games(date DESC);
CREATE INDEX IF NOT EXISTS idx_games_script ON games(script);
