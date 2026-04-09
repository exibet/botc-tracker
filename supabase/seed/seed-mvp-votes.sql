-- Seed: one game with MVP votes (additive, does not delete existing data)
-- 2026-04-09 Trouble Brewing, 8 players, good wins
-- 5 of 8 voted (62.5% quorum), Oleg gets 3 votes → MVP

DO $$
DECLARE
  g_id UUID := gen_random_uuid();
  p_oleg      UUID;
  p_nastya    UUID;
  p_sergiy    UUID;
  p_kateryna  UUID;
  p_vlad      UUID;
  p_bogdan    UUID;
  p_anya      UUID;
  p_ruslan    UUID;
  p_artur     UUID;
BEGIN
  -- Look up existing player IDs by nickname
  SELECT id INTO p_oleg     FROM profiles WHERE nickname = 'Олег';
  SELECT id INTO p_nastya   FROM profiles WHERE nickname = 'Настя';
  SELECT id INTO p_sergiy   FROM profiles WHERE nickname = 'Сергій';
  SELECT id INTO p_kateryna FROM profiles WHERE nickname = 'Катерина Осаульчук';
  SELECT id INTO p_vlad     FROM profiles WHERE nickname = 'Влад';
  SELECT id INTO p_bogdan   FROM profiles WHERE nickname = 'Богдан';
  SELECT id INTO p_anya     FROM profiles WHERE nickname = 'Аня';
  SELECT id INTO p_ruslan   FROM profiles WHERE nickname = 'Руслан';
  SELECT id INTO p_artur    FROM profiles WHERE nickname = 'Артур';

  -- Game
  INSERT INTO games (id, date, script, winner, player_count, created_by)
  VALUES (g_id, '2026-04-09', 'trouble_brewing', 'good', 8, p_artur);

  -- Players
  INSERT INTO game_players (game_id, player_id, starting_role_id, ending_role_id, alignment_start, alignment_end, is_alive, is_mvp, added_by) VALUES
    (g_id, p_oleg,      'fortuneteller',  'fortuneteller',  'good', 'good', true,  false, p_artur),
    (g_id, p_nastya,    'empath',         'empath',         'good', 'good', true,  false, p_artur),
    (g_id, p_sergiy,    'imp',            'imp',            'evil', 'evil', false, false, p_artur),
    (g_id, p_kateryna,  'poisoner',       'poisoner',       'evil', 'evil', false, false, p_artur),
    (g_id, p_vlad,      'monk',           'monk',           'good', 'good', true,  false, p_artur),
    (g_id, p_bogdan,    'ravenkeeper',    'ravenkeeper',    'good', 'good', false, false, p_artur),
    (g_id, p_anya,      'washerwoman',    'washerwoman',    'good', 'good', true,  false, p_artur),
    (g_id, p_ruslan,    'scarletwoman',   'scarletwoman',   'evil', 'evil', true,  false, p_artur);

  -- MVP Votes (5 of 8 = 62.5% quorum met)
  -- Oleg: 3 votes, Nastya: 2 votes → Oleg becomes MVP via trigger
  INSERT INTO mvp_votes (game_id, voter_id, candidate_id) VALUES
    (g_id, p_nastya, p_oleg),
    (g_id, p_vlad,   p_oleg),
    (g_id, p_anya,   p_oleg),
    (g_id, p_bogdan, p_nastya),
    (g_id, p_ruslan, p_nastya);

END $$;
