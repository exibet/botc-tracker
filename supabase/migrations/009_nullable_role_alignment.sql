-- Allow players to join a game without selecting a role/alignment upfront
ALTER TABLE game_players
  ALTER COLUMN starting_role_id DROP NOT NULL,
  ALTER COLUMN alignment_start DROP NOT NULL;
