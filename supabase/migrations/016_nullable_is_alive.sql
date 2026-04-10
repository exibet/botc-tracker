-- Make is_alive nullable with NULL default
-- Players joining a game should have unknown alive status initially
ALTER TABLE game_players
  ALTER COLUMN is_alive DROP NOT NULL,
  ALTER COLUMN is_alive SET DEFAULT NULL;
