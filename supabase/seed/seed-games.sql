-- Seed script: BotC game data from real game logs
-- Generated for botc-tracker
-- Idempotent: deletes existing data first, then inserts fresh
-- All role IDs are hardcoded to avoid PostgreSQL subquery optimization issues

-- Step 1: Clean existing data (respecting FK order)
DELETE FROM mvp_votes;
DELETE FROM game_players;
DELETE FROM games;
DELETE FROM profiles WHERE is_manual = true;

DO $$
DECLARE
  -- Player UUIDs (34 unique players)
  p_sergiy           UUID := gen_random_uuid();
  p_nastya           UUID := gen_random_uuid();
  p_oleg             UUID := gen_random_uuid();
  p_kateryna         UUID := gen_random_uuid();
  p_volodymyr        UUID := gen_random_uuid();
  p_lena             UUID := gen_random_uuid();
  p_bogdan_s         UUID := gen_random_uuid();
  p_bogdan           UUID := gen_random_uuid();
  p_vlad             UUID := gen_random_uuid();
  p_viktoriya        UUID := gen_random_uuid();
  p_ruslan           UUID := gen_random_uuid();
  p_maria            UUID := gen_random_uuid();
  p_yulya            UUID := gen_random_uuid();
  p_nastya_n         UUID := gen_random_uuid();
  p_ira              UUID := gen_random_uuid();
  p_anya             UUID := gen_random_uuid();
  p_sasha            UUID := gen_random_uuid();
  p_olya             UUID := gen_random_uuid();
  p_viktor           UUID := gen_random_uuid();
  p_dima             UUID := gen_random_uuid();
  p_tony             UUID := gen_random_uuid();
  p_misha            UUID := gen_random_uuid();
  p_yaroslav         UUID := gen_random_uuid();
  p_artem            UUID := gen_random_uuid();
  p_denys            UUID := gen_random_uuid();
  p_alyona           UUID := gen_random_uuid();
  p_tetyana          UUID := gen_random_uuid();
  p_ivanka           UUID := gen_random_uuid();
  p_natali           UUID := gen_random_uuid();
  p_inna             UUID := gen_random_uuid();
  p_illya            UUID := gen_random_uuid();
  p_sergiy_o         UUID := gen_random_uuid();
  p_artur            UUID := gen_random_uuid();
  p_choirboy         UUID := gen_random_uuid(); -- placeholder, not used

  -- Game UUIDs (33 games)
  g1   UUID := gen_random_uuid();  -- 2026-01-06 Game 1
  g2   UUID := gen_random_uuid();  -- 2026-01-06 Game 2
  g3   UUID := gen_random_uuid();  -- 2026-01-11 Game 1
  g4   UUID := gen_random_uuid();  -- 2026-01-11 Game 2
  g5   UUID := gen_random_uuid();  -- 2026-01-11 Game 3
  g6   UUID := gen_random_uuid();  -- 2026-01-13 Game 1
  g7   UUID := gen_random_uuid();  -- 2026-01-13 Game 2
  g8   UUID := gen_random_uuid();  -- 2026-01-18 Game 1
  g9   UUID := gen_random_uuid();  -- 2026-01-18 Game 2
  g10  UUID := gen_random_uuid();  -- 2026-01-22 Game 1
  g11  UUID := gen_random_uuid();  -- 2026-01-22 Game 2
  g12  UUID := gen_random_uuid();  -- 2026-02-01 Game 1
  g13  UUID := gen_random_uuid();  -- 2026-02-01 Game 2
  g14  UUID := gen_random_uuid();  -- 2026-02-01 Game 3
  g15  UUID := gen_random_uuid();  -- 2026-02-01 Game 4
  g16  UUID := gen_random_uuid();  -- 2026-02-08 Game 1
  g17  UUID := gen_random_uuid();  -- 2026-02-08 Game 2
  g18  UUID := gen_random_uuid();  -- 2026-02-13 Game 1
  g19  UUID := gen_random_uuid();  -- 2026-02-13 Game 2
  g20  UUID := gen_random_uuid();  -- 2026-02-13 Game 3
  g21  UUID := gen_random_uuid();  -- 2026-02-22 Game 1
  g22  UUID := gen_random_uuid();  -- 2026-02-22 Game 2
  g23  UUID := gen_random_uuid();  -- 2026-02-22 Game 3
  g24  UUID := gen_random_uuid();  -- 2026-02-22 Game 4
  g25  UUID := gen_random_uuid();  -- 2026-03-01 Game 1
  g26  UUID := gen_random_uuid();  -- 2026-03-01 Game 2
  g27  UUID := gen_random_uuid();  -- 2026-03-01 Game 3
  g28  UUID := gen_random_uuid();  -- 2026-03-22 Game 1
  g29  UUID := gen_random_uuid();  -- 2026-03-22 Game 2
  g30  UUID := gen_random_uuid();  -- 2026-03-22 Game 3
  g31  UUID := gen_random_uuid();  -- 2026-03-27 Game 1
  g32  UUID := gen_random_uuid();  -- 2026-03-27 Game 2
  g33  UUID := gen_random_uuid();  -- 2026-03-27 Game 3

BEGIN
  -- ============================================================
  -- PROFILES (all manual players)
  -- ============================================================
  INSERT INTO profiles (id, nickname, is_manual, role) VALUES
    (p_sergiy,     'Сергій',              true, 'player'),
    (p_nastya,     'Настя',               true, 'player'),
    (p_oleg,       'Олег',                true, 'player'),
    (p_kateryna,   'Катерина Осаульчук',  true, 'player'),
    (p_volodymyr,  'Володимир',           true, 'player'),
    (p_lena,       'Лена',                true, 'player'),
    (p_bogdan_s,   'Богдан Соловей',      true, 'player'),
    (p_bogdan,     'Богдан',              true, 'player'),
    (p_vlad,       'Влад',                true, 'player'),
    (p_viktoriya,  'Вікторія',            true, 'player'),
    (p_ruslan,     'Руслан',              true, 'player'),
    (p_maria,      'Марія',               true, 'player'),
    (p_yulya,      'Юля',                 true, 'player'),
    (p_nastya_n,   'Настя Nstu',          true, 'player'),
    (p_ira,        'Іра',                 true, 'player'),
    (p_anya,       'Аня',                 true, 'player'),
    (p_sasha,      'Саша',                true, 'player'),
    (p_olya,       'Оля',                 true, 'player'),
    (p_viktor,     'Віктор',              true, 'player'),
    (p_dima,       'Діма',                true, 'player'),
    (p_tony,       'TONY',                true, 'player'),
    (p_misha,      'Міша',                true, 'player'),
    (p_yaroslav,   'Ярослав',             true, 'player'),
    (p_artem,      'Артем',               true, 'player'),
    (p_denys,      'Денис',               true, 'player'),
    (p_alyona,     'Альона',              true, 'player'),
    (p_tetyana,    'Тетяна',              true, 'player'),
    (p_ivanka,     'Іванка',              true, 'player'),
    (p_natali,     'Наталі',              true, 'player'),
    (p_inna,       'Інна',                true, 'player'),
    (p_illya,      'Ілля',                true, 'player'),
    (p_sergiy_o,   'Сергій Осаульчук',    true, 'player'),
    (p_artur,      'Артур',               true, 'player');

  -- ============================================================
  -- GAMES
  -- ============================================================
  -- Winner: determined by Demon's result. Demon Перемога = 'evil', Demon Поразка = 'good'
  -- Scripts cycle: trouble_brewing, bad_moon_rising, sects_and_violets
  INSERT INTO games (id, date, script, winner, status, player_count, created_by) VALUES
    (g1,  '2026-01-06', 'trouble_brewing',    'good', 'finished', 12, p_artur),
    (g2,  '2026-01-06', 'bad_moon_rising',    'good', 'finished', 12, p_artur),
    (g3,  '2026-01-11', 'sects_and_violets',  'good', 'finished', 13, p_artur),
    (g4,  '2026-01-11', 'trouble_brewing',    'good', 'finished', 12, p_artur),
    (g5,  '2026-01-11', 'bad_moon_rising',    'evil', 'finished', 10, p_artur),
    (g6,  '2026-01-13', 'sects_and_violets',  'good', 'finished', 11, p_artur),
    (g7,  '2026-01-13', 'trouble_brewing',    'evil', 'finished', 11, p_artur),
    (g8,  '2026-01-18', 'bad_moon_rising',    'good', 'finished', 14, p_artur),
    (g9,  '2026-01-18', 'sects_and_violets',  'evil', 'finished', 13, p_artur),
    (g10, '2026-01-22', 'trouble_brewing',    'good', 'finished', 10, p_artur),
    (g11, '2026-01-22', 'bad_moon_rising',    'good', 'finished', 11, p_artur),
    (g12, '2026-02-01', 'sects_and_violets',  'good', 'finished',  6, p_artur),
    (g13, '2026-02-01', 'trouble_brewing',    'good', 'finished',  7, p_artur),
    (g14, '2026-02-01', 'bad_moon_rising',    'evil', 'finished',  8, p_artur),
    (g15, '2026-02-01', 'sects_and_violets',  'good', 'finished',  7, p_artur),
    (g16, '2026-02-08', 'trouble_brewing',    'evil', 'finished', 15, p_artur),
    (g17, '2026-02-08', 'bad_moon_rising',    'good', 'finished', 10, p_artur),
    (g18, '2026-02-13', 'sects_and_violets',  'evil', 'finished',  9, p_artur),
    (g19, '2026-02-13', 'trouble_brewing',    'evil', 'finished', 12, p_artur),
    (g20, '2026-02-13', 'bad_moon_rising',    'evil', 'finished', 10, p_artur),
    (g21, '2026-02-22', 'sects_and_violets',  'evil', 'finished',  7, p_artur),
    (g22, '2026-02-22', 'trouble_brewing',    'good', 'finished',  8, p_artur),
    (g23, '2026-02-22', 'bad_moon_rising',    'good', 'finished', 11, p_artur),
    (g24, '2026-02-22', 'sects_and_violets',  'evil', 'finished', 11, p_artur),
    (g25, '2026-03-01', 'trouble_brewing',    'evil', 'finished',  8, p_artur),
    (g26, '2026-03-01', 'bad_moon_rising',    'good', 'finished',  8, p_artur),
    (g27, '2026-03-01', 'sects_and_violets',  'evil', 'finished',  8, p_artur),
    (g28, '2026-03-22', 'trouble_brewing',    'good', 'finished',  9, p_artur),
    (g29, '2026-03-22', 'bad_moon_rising',    'good', 'finished', 10, p_artur),
    (g30, '2026-03-22', 'sects_and_violets',  'good', 'finished',  9, p_artur),
    (g31, '2026-03-27', 'trouble_brewing',    'evil', 'finished',  8, p_artur),
    (g32, '2026-03-27', 'bad_moon_rising',    'good', 'finished',  8, p_artur),
    (g33, '2026-03-27', 'sects_and_violets',  'evil', 'finished', 10, p_artur);

  -- ============================================================
  -- GAME PLAYERS
  -- All role IDs are hardcoded. No subqueries, no random().
  -- ============================================================

  -- -------------------------------------------------------
  -- g1: 2026-01-06 Game 1 (12 players, good wins)
  -- -------------------------------------------------------
  INSERT INTO game_players (game_id, player_id, starting_role_id, ending_role_id, alignment_start, alignment_end, is_alive, is_mvp, added_by) VALUES
    (g1, p_sergiy,    'imp',            'imp',            'evil', 'evil', true, false, p_artur),
    (g1, p_nastya,    'empath',         'empath',         'good', 'good', true, false, p_artur),
    (g1, p_oleg,      'fortuneteller',  'fortuneteller',  'good', 'good', true, true,  p_artur),
    (g1, p_kateryna,  'poisoner',       'poisoner',       'evil', 'evil', true, false, p_artur),
    (g1, p_volodymyr, 'drunk',          'drunk',          'good', 'good', true, false, p_artur),
    (g1, p_lena,      'undertaker',     'undertaker',     'good', 'good', true, false, p_artur),
    (g1, p_bogdan_s,  'monk',           'monk',           'good', 'good', true, false, p_artur),
    (g1, p_bogdan,    'ravenkeeper',    'ravenkeeper',    'good', 'good', true, false, p_artur),
    (g1, p_vlad,      'scarletwoman',   'scarletwoman',   'evil', 'evil', true, false, p_artur),
    (g1, p_viktoriya, 'recluse',        'recluse',        'good', 'good', true, false, p_artur),
    (g1, p_ruslan,    'virgin',         'virgin',         'good', 'good', true, false, p_artur),
    (g1, p_maria,     'slayer',         'slayer',         'good', 'good', true, false, p_artur);

  -- -------------------------------------------------------
  -- g2: 2026-01-06 Game 2 (12 players, good wins)
  -- Demon: Сергій (Поразка), also Лена is Демон (Поразка) - two demons? No, each game has one demon.
  -- Actually looking at data: Сергій=Демон and Лена=Демон both in game 2. This might be a Legion game or data entry.
  -- We'll treat Сергій as the primary demon, Лена as a second demon (possible in some scripts).
  -- Both lost, so good wins.
  -- -------------------------------------------------------
  INSERT INTO game_players (game_id, player_id, starting_role_id, ending_role_id, alignment_start, alignment_end, is_alive, is_mvp, added_by) VALUES
    (g2, p_sergiy,    'nodashii',       'nodashii',       'evil', 'evil', true, false, p_artur),
    (g2, p_nastya,    'soldier',        'soldier',        'good', 'good', true, false, p_artur),
    (g2, p_oleg,      'godfather',      'godfather',      'evil', 'evil', true, false, p_artur),
    (g2, p_kateryna,  'mayor',          'mayor',          'good', 'good', true, false, p_artur),
    (g2, p_volodymyr, 'washerwoman',    'washerwoman',    'good', 'good', true, false, p_artur),
    (g2, p_lena,      'zombuul',        'zombuul',        'evil', 'evil', true, false, p_artur),
    (g2, p_bogdan_s,  'librarian',      'librarian',      'good', 'good', true, true,  p_artur),
    (g2, p_bogdan,    'investigator',   'investigator',   'good', 'good', true, false, p_artur),
    (g2, p_vlad,      'chef',           'chef',           'good', 'good', true, false, p_artur),
    (g2, p_viktoriya, 'clockmaker',     'clockmaker',     'good', 'good', true, false, p_artur),
    (g2, p_ruslan,    'baron',          'baron',          'evil', 'evil', true, false, p_artur),
    (g2, p_maria,     'dreamer',        'dreamer',        'good', 'good', true, false, p_artur);

  -- -------------------------------------------------------
  -- g3: 2026-01-11 Game 1 (13 players, good wins)
  -- -------------------------------------------------------
  INSERT INTO game_players (game_id, player_id, starting_role_id, ending_role_id, alignment_start, alignment_end, is_alive, is_mvp, added_by) VALUES
    (g3, p_oleg,      'seamstress',     'seamstress',     'good', 'good', true, false, p_artur),
    (g3, p_nastya,    'saint',          'saint',          'good', 'good', true, false, p_artur),
    (g3, p_vlad,      'butler',         'butler',         'good', 'good', true, false, p_artur),
    (g3, p_yulya,     'philosopher',    'philosopher',    'good', 'good', true, false, p_artur),
    (g3, p_lena,      'artist',         'artist',         'good', 'good', true, false, p_artur),
    (g3, p_kateryna,  'juggler',        'juggler',        'good', 'good', true, false, p_artur),
    (g3, p_volodymyr, 'sage',           'sage',           'good', 'good', true, false, p_artur),
    (g3, p_nastya_n,  'tealady',        'tealady',        'good', 'good', true, false, p_artur),
    (g3, p_ira,       'barber',         'barber',         'good', 'good', true, false, p_artur),
    (g3, p_anya,      'oracle',         'oracle',         'good', 'good', true, false, p_artur),
    (g3, p_bogdan,    'pukka',          'pukka',          'evil', 'evil', true, false, p_artur),
    (g3, p_bogdan_s,  'witch',          'witch',          'evil', 'evil', true, false, p_artur),
    (g3, p_ruslan,    'cerenovus',      'cerenovus',      'evil', 'evil', true, false, p_artur);

  -- -------------------------------------------------------
  -- g4: 2026-01-11 Game 2 (12 players, good wins)
  -- -------------------------------------------------------
  INSERT INTO game_players (game_id, player_id, starting_role_id, ending_role_id, alignment_start, alignment_end, is_alive, is_mvp, added_by) VALUES
    (g4, p_oleg,      'savant',         'savant',         'good', 'good', true, false, p_artur),
    (g4, p_lena,      'flowergirl',     'flowergirl',     'good', 'good', true, false, p_artur),
    (g4, p_vlad,      'towncrier',      'towncrier',      'good', 'good', true, false, p_artur),
    (g4, p_bogdan_s,  'snakecharmer',   'snakecharmer',   'good', 'good', true, false, p_artur),
    (g4, p_yulya,     'mathematician',  'mathematician',  'good', 'good', true, false, p_artur),
    (g4, p_volodymyr, 'innkeeper',      'innkeeper',      'good', 'good', true, false, p_artur),
    (g4, p_ruslan,    'gambler',        'gambler',        'good', 'good', true, true,  p_artur),
    (g4, p_ira,       'sweetheart',     'sweetheart',     'good', 'good', true, false, p_artur),
    (g4, p_anya,      'vigormortis',    'vigormortis',    'evil', 'evil', true, false, p_artur),
    (g4, p_kateryna,  'devilsadvocate', 'devilsadvocate', 'evil', 'evil', true, false, p_artur),
    (g4, p_sasha,     'assassin',       'assassin',       'evil', 'evil', true, false, p_artur),
    (g4, p_nastya,    'mastermind',     'mastermind',     'evil', 'evil', true, false, p_artur);

  -- -------------------------------------------------------
  -- g5: 2026-01-11 Game 3 (10 players, evil wins)
  -- -------------------------------------------------------
  INSERT INTO game_players (game_id, player_id, starting_role_id, ending_role_id, alignment_start, alignment_end, is_alive, is_mvp, added_by) VALUES
    (g5, p_oleg,      'exorcist',       'exorcist',       'good', 'good', true, false, p_artur),
    (g5, p_nastya,    'fool',           'fool',           'good', 'good', true, false, p_artur),
    (g5, p_lena,      'klutz',          'klutz',          'good', 'good', true, false, p_artur),
    (g5, p_vlad,      'grandmother',    'grandmother',    'good', 'good', true, false, p_artur),
    (g5, p_volodymyr, 'sailor',         'sailor',         'good', 'good', true, false, p_artur),
    (g5, p_ruslan,    'courtier',       'courtier',       'good', 'good', true, false, p_artur),
    (g5, p_anya,      'professor',      'professor',      'good', 'good', true, false, p_artur),
    (g5, p_ira,       'vortox',         'vortox',         'evil', 'evil', true, false, p_artur),
    (g5, p_sasha,     'pithag',         'pithag',         'evil', 'evil', true, true,  p_artur),
    (g5, p_kateryna,  'eviltwin',       'eviltwin',       'evil', 'evil', true, false, p_artur);

  -- -------------------------------------------------------
  -- g6: 2026-01-13 Game 1 (11 players, good wins)
  -- -------------------------------------------------------
  INSERT INTO game_players (game_id, player_id, starting_role_id, ending_role_id, alignment_start, alignment_end, is_alive, is_mvp, added_by) VALUES
    (g6, p_nastya,    'goblin',         'goblin',         'evil', 'evil', true, false, p_artur),
    (g6, p_oleg,      'fearmonger',     'fearmonger',     'evil', 'evil', true, false, p_artur),
    (g6, p_ruslan,    'fanggu',         'fanggu',         'evil', 'evil', true, false, p_artur),
    (g6, p_maria,     'chambermaid',    'chambermaid',    'good', 'good', true, false, p_artur),
    (g6, p_kateryna,  'nightwatchman',  'nightwatchman',  'good', 'good', true, false, p_artur),
    (g6, p_volodymyr, 'bountyhunter',   'bountyhunter',   'good', 'good', true, false, p_artur),
    (g6, p_lena,      'pixie',          'pixie',          'good', 'good', true, false, p_artur),
    (g6, p_yulya,     'huntsman',       'huntsman',       'good', 'good', true, false, p_artur),
    (g6, p_bogdan_s,  'choirboy',       'choirboy',       'good', 'good', true, false, p_artur),
    (g6, p_vlad,      'alchemist',      'alchemist',      'good', 'good', true, true,  p_artur),
    (g6, p_bogdan,    'noble',          'noble',          'good', 'good', true, false, p_artur);

  -- -------------------------------------------------------
  -- g7: 2026-01-13 Game 2 (11 players, evil wins)
  -- -------------------------------------------------------
  INSERT INTO game_players (game_id, player_id, starting_role_id, ending_role_id, alignment_start, alignment_end, is_alive, is_mvp, added_by) VALUES
    (g7, p_yulya,     'shabaloth',      'shabaloth',      'evil', 'evil', true, true,  p_artur),
    (g7, p_nastya,    'psychopath',     'psychopath',     'evil', 'evil', true, false, p_artur),
    (g7, p_maria,     'mezepheles',     'mezepheles',     'evil', 'evil', true, false, p_artur),
    (g7, p_lena,      'moonchild',      'moonchild',      'good', 'good', true, true,  p_artur),
    (g7, p_volodymyr, 'cannibal',       'cannibal',       'good', 'good', true, false, p_artur),
    (g7, p_bogdan_s,  'king',           'king',           'good', 'good', true, false, p_artur),
    (g7, p_vlad,      'knight',         'knight',         'good', 'good', true, false, p_artur),
    (g7, p_bogdan,    'steward',        'steward',        'good', 'good', true, false, p_artur),
    (g7, p_ruslan,    'fisherman',      'fisherman',      'good', 'good', true, false, p_artur),
    (g7, p_oleg,      'balloonist',     'balloonist',     'good', 'good', true, false, p_artur),
    (g7, p_kateryna,  'amnesiac',       'amnesiac',       'good', 'good', true, false, p_artur);

  -- -------------------------------------------------------
  -- g8: 2026-01-18 Game 1 (14 players, good wins)
  -- -------------------------------------------------------
  INSERT INTO game_players (game_id, player_id, starting_role_id, ending_role_id, alignment_start, alignment_end, is_alive, is_mvp, added_by) VALUES
    (g8, p_olya,      'empath',         'empath',         'good', 'good', true, false, p_artur),
    (g8, p_yulya,     'fortuneteller',  'fortuneteller',  'good', 'good', true, false, p_artur),
    (g8, p_bogdan_s,  'undertaker',     'undertaker',     'good', 'good', true, false, p_artur),
    (g8, p_bogdan,    'monk',           'monk',           'good', 'good', true, false, p_artur),
    (g8, p_viktor,    'drunk',          'drunk',          'good', 'good', true, false, p_artur),
    (g8, p_oleg,      'ravenkeeper',    'ravenkeeper',    'good', 'good', true, false, p_artur),
    (g8, p_dima,      'virgin',         'virgin',         'good', 'good', true, false, p_artur),
    (g8, p_lena,      'slayer',         'slayer',         'good', 'good', true, false, p_artur),
    (g8, p_tony,      'soldier',        'soldier',        'good', 'good', true, false, p_artur),
    (g8, p_ira,       'mayor',          'mayor',          'good', 'good', true, false, p_artur),
    (g8, p_anya,      'po',             'po',             'evil', 'evil', true, false, p_artur),
    (g8, p_volodymyr, 'spy',            'spy',            'evil', 'evil', true, false, p_artur),
    (g8, p_vlad,      'baron',          'baron',          'evil', 'evil', true, false, p_artur),
    (g8, p_misha,     'scarletwoman',   'scarletwoman',   'evil', 'evil', true, false, p_artur);

  -- -------------------------------------------------------
  -- g9: 2026-01-18 Game 2 (13 players, evil wins)
  -- -------------------------------------------------------
  INSERT INTO game_players (game_id, player_id, starting_role_id, ending_role_id, alignment_start, alignment_end, is_alive, is_mvp, added_by) VALUES
    (g9, p_misha,     'lleech',         'lleech',         'evil', 'evil', true, true,  p_artur),
    (g9, p_dima,      'poisoner',       'poisoner',       'evil', 'evil', true, false, p_artur),
    (g9, p_volodymyr, 'godfather',      'godfather',      'evil', 'evil', true, false, p_artur),
    (g9, p_sasha,     'witch',          'witch',          'evil', 'evil', true, false, p_artur),
    (g9, p_anya,      'washerwoman',    'washerwoman',    'good', 'good', true, false, p_artur),
    (g9, p_ira,       'librarian',      'librarian',      'good', 'good', true, false, p_artur),
    (g9, p_olya,      'investigator',   'investigator',   'good', 'good', true, false, p_artur),
    (g9, p_yulya,     'chef',           'chef',           'good', 'good', true, false, p_artur),
    (g9, p_bogdan,    'clockmaker',     'clockmaker',     'good', 'good', true, false, p_artur),
    (g9, p_vlad,      'dreamer',        'dreamer',        'good', 'good', true, false, p_artur),
    (g9, p_viktor,    'seamstress',     'seamstress',     'good', 'good', true, false, p_artur),
    (g9, p_oleg,      'philosopher',    'philosopher',    'good', 'good', true, false, p_artur),
    (g9, p_lena,      'artist',         'artist',         'good', 'good', true, false, p_artur);

  -- -------------------------------------------------------
  -- g10: 2026-01-22 Game 1 (10 players, good wins)
  -- -------------------------------------------------------
  INSERT INTO game_players (game_id, player_id, starting_role_id, ending_role_id, alignment_start, alignment_end, is_alive, is_mvp, added_by) VALUES
    (g10, p_nastya,    'imp',            'imp',            'evil', 'evil', true, false, p_artur),
    (g10, p_vlad,      'assassin',       'assassin',       'evil', 'evil', true, false, p_artur),
    (g10, p_bogdan,    'juggler',        'juggler',        'good', 'good', true, false, p_artur),
    (g10, p_ruslan,    'recluse',        'recluse',        'good', 'good', true, false, p_artur),
    (g10, p_volodymyr, 'sage',           'sage',           'good', 'good', true, false, p_artur),
    (g10, p_kateryna,  'tealady',        'tealady',        'good', 'good', true, false, p_artur),
    (g10, p_ira,       'saint',          'saint',          'good', 'good', true, false, p_artur),
    (g10, p_yulya,     'oracle',         'oracle',         'good', 'good', true, false, p_artur),
    (g10, p_bogdan_s,  'savant',         'savant',         'good', 'good', true, false, p_artur),
    (g10, p_lena,      'flowergirl',     'flowergirl',     'good', 'good', true, false, p_artur);

  -- -------------------------------------------------------
  -- g11: 2026-01-22 Game 2 (11 players, good wins)
  -- -------------------------------------------------------
  INSERT INTO game_players (game_id, player_id, starting_role_id, ending_role_id, alignment_start, alignment_end, is_alive, is_mvp, added_by) VALUES
    (g11, p_vlad,      'nodashii',       'nodashii',       'evil', 'evil', true, false, p_artur),
    (g11, p_nastya,    'devilsadvocate', 'devilsadvocate', 'evil', 'evil', true, false, p_artur),
    (g11, p_ira,       'mastermind',     'mastermind',     'evil', 'evil', true, false, p_artur),
    (g11, p_lena,      'towncrier',      'towncrier',      'good', 'good', true, false, p_artur),
    (g11, p_bogdan,    'snakecharmer',   'snakecharmer',   'good', 'good', true, false, p_artur),
    (g11, p_ruslan,    'butler',         'butler',         'good', 'good', true, false, p_artur),
    (g11, p_volodymyr, 'mathematician',  'mathematician',  'good', 'good', true, false, p_artur),
    (g11, p_kateryna,  'innkeeper',      'innkeeper',      'good', 'good', true, true,  p_artur),
    (g11, p_yulya,     'gambler',        'gambler',        'good', 'good', true, false, p_artur),
    (g11, p_bogdan_s,  'exorcist',       'exorcist',       'good', 'good', true, false, p_artur),
    (g11, p_sasha,     'lunatic',        'lunatic',        'good', 'good', true, false, p_artur);

  -- -------------------------------------------------------
  -- g12: 2026-02-01 Game 1 (6 players, good wins)
  -- -------------------------------------------------------
  INSERT INTO game_players (game_id, player_id, starting_role_id, ending_role_id, alignment_start, alignment_end, is_alive, is_mvp, added_by) VALUES
    (g12, p_ira,       'zombuul',        'zombuul',        'evil', 'evil', true, false, p_artur),
    (g12, p_vlad,      'scarletwoman',   'scarletwoman',   'evil', 'evil', true, false, p_artur),
    (g12, p_volodymyr, 'acrobat',        'acrobat',        'good', 'good', true, false, p_artur),
    (g12, p_kateryna,  'mutant',         'mutant',         'good', 'good', true, false, p_artur),
    (g12, p_nastya,    'chambermaid',    'chambermaid',    'good', 'good', true, true,  p_artur),
    (g12, p_bogdan,    'nightwatchman',  'nightwatchman',  'good', 'good', true, false, p_artur);

  -- -------------------------------------------------------
  -- g13: 2026-02-01 Game 2 (7 players, good wins)
  -- -------------------------------------------------------
  INSERT INTO game_players (game_id, player_id, starting_role_id, ending_role_id, alignment_start, alignment_end, is_alive, is_mvp, added_by) VALUES
    (g13, p_bogdan,    'pukka',          'pukka',          'evil', 'evil', true, false, p_artur),
    (g13, p_kateryna,  'cerenovus',      'cerenovus',      'evil', 'evil', true, false, p_artur),
    (g13, p_maria,     'bountyhunter',   'bountyhunter',   'good', 'good', true, false, p_artur),
    (g13, p_ira,       'pixie',          'pixie',          'good', 'good', true, false, p_artur),
    (g13, p_vlad,      'huntsman',       'huntsman',       'good', 'good', true, false, p_artur),
    (g13, p_nastya,    'choirboy',       'choirboy',       'good', 'good', true, true,  p_artur),
    (g13, p_volodymyr, 'alchemist',      'alchemist',      'good', 'good', true, false, p_artur);

  -- -------------------------------------------------------
  -- g14: 2026-02-01 Game 3 (8 players, evil wins)
  -- -------------------------------------------------------
  INSERT INTO game_players (game_id, player_id, starting_role_id, ending_role_id, alignment_start, alignment_end, is_alive, is_mvp, added_by) VALUES
    (g14, p_maria,     'vigormortis',    'vigormortis',    'evil', 'evil', true, false, p_artur),
    (g14, p_nastya,    'eviltwin',       'eviltwin',       'evil', 'evil', true, true,  p_artur),
    (g14, p_ira,       'noble',          'noble',          'good', 'good', true, false, p_artur),
    (g14, p_bogdan,    'cannibal',       'cannibal',       'good', 'good', true, false, p_artur),
    (g14, p_vlad,      'king',           'king',           'good', 'good', true, false, p_artur),
    (g14, p_volodymyr, 'knight',         'knight',         'good', 'good', true, false, p_artur),
    (g14, p_kateryna,  'steward',        'steward',        'good', 'good', true, false, p_artur),
    (g14, p_sasha,     'heretic',        'heretic',        'good', 'good', true, false, p_artur);

  -- -------------------------------------------------------
  -- g15: 2026-02-01 Game 4 (7 players, good wins)
  -- -------------------------------------------------------
  INSERT INTO game_players (game_id, player_id, starting_role_id, ending_role_id, alignment_start, alignment_end, is_alive, is_mvp, added_by) VALUES
    (g15, p_ira,       'vortox',         'vortox',         'evil', 'evil', true, false, p_artur),
    (g15, p_sasha,     'pithag',         'pithag',         'evil', 'evil', true, false, p_artur),
    (g15, p_nastya,    'fisherman',      'fisherman',      'good', 'good', true, false, p_artur),
    (g15, p_kateryna,  'balloonist',     'balloonist',     'good', 'good', true, false, p_artur),
    (g15, p_maria,     'amnesiac',       'amnesiac',       'good', 'good', true, false, p_artur),
    (g15, p_volodymyr, 'snitch',         'snitch',         'good', 'good', true, false, p_artur),
    (g15, p_vlad,      'farmer',         'farmer',         'good', 'good', true, false, p_artur);

  -- -------------------------------------------------------
  -- g16: 2026-02-08 Game 1 (15 players, evil wins)
  -- -------------------------------------------------------
  INSERT INTO game_players (game_id, player_id, starting_role_id, ending_role_id, alignment_start, alignment_end, is_alive, is_mvp, added_by) VALUES
    (g16, p_ruslan,    'alhadikhia',     'alhadikhia',     'evil', 'evil', true, false, p_artur),
    (g16, p_nastya,    'poisoner',       'poisoner',       'evil', 'evil', true, false, p_artur),
    (g16, p_oleg,      'spy',            'spy',            'evil', 'evil', true, false, p_artur),
    (g16, p_yaroslav,  'baron',          'baron',          'evil', 'evil', true, false, p_artur),
    (g16, p_artem,     'goblin',         'goblin',         'evil', 'evil', true, false, p_artur),
    (g16, p_bogdan_s,  'golem',          'golem',          'good', 'good', true, false, p_artur),
    (g16, p_denys,     'lunatic',        'lunatic',        'good', 'good', true, false, p_artur),
    (g16, p_volodymyr, 'barber',         'barber',         'good', 'good', true, false, p_artur),
    (g16, p_yulya,     'empath',         'empath',         'good', 'good', true, false, p_artur),
    (g16, p_anya,      'fortuneteller',  'fortuneteller',  'good', 'good', true, false, p_artur),
    (g16, p_bogdan,    'undertaker',     'undertaker',     'good', 'good', true, false, p_artur),
    (g16, p_alyona,    'monk',           'monk',           'good', 'good', true, false, p_artur),
    (g16, p_vlad,      'ravenkeeper',    'ravenkeeper',    'good', 'good', true, false, p_artur),
    (g16, p_ivanka,    'virgin',         'virgin',         'good', 'good', true, false, p_artur),
    (g16, p_tetyana,   'slayer',         'slayer',         'good', 'good', true, false, p_artur);

  -- -------------------------------------------------------
  -- g17: 2026-02-08 Game 2 (10 players, good wins)
  -- -------------------------------------------------------
  INSERT INTO game_players (game_id, player_id, starting_role_id, ending_role_id, alignment_start, alignment_end, is_alive, is_mvp, added_by) VALUES
    (g17, p_nastya,    'godfather',      'godfather',      'evil', 'evil', true, false, p_artur),
    (g17, p_ruslan,    'shabaloth',      'shabaloth',      'evil', 'evil', true, false, p_artur),
    (g17, p_volodymyr, 'fearmonger',     'fearmonger',     'evil', 'evil', true, false, p_artur),
    (g17, p_oleg,      'sweetheart',     'sweetheart',     'good', 'good', true, true,  p_artur),
    (g17, p_bogdan,    'klutz',          'klutz',          'good', 'good', true, false, p_artur),
    (g17, p_ira,       'soldier',        'soldier',        'good', 'good', true, false, p_artur),
    (g17, p_yaroslav,  'mayor',          'mayor',          'good', 'good', true, false, p_artur),
    (g17, p_vlad,      'washerwoman',    'washerwoman',    'good', 'good', true, false, p_artur),
    (g17, p_ivanka,    'librarian',      'librarian',      'good', 'good', true, false, p_artur),
    (g17, p_sergiy,    'investigator',   'investigator',   'good', 'good', true, false, p_artur);

  -- -------------------------------------------------------
  -- g18: 2026-02-13 Game 1 (9 players, evil wins)
  -- -------------------------------------------------------
  INSERT INTO game_players (game_id, player_id, starting_role_id, ending_role_id, alignment_start, alignment_end, is_alive, is_mvp, added_by) VALUES
    (g18, p_viktoriya, 'fanggu',         'fanggu',         'evil', 'evil', true, false, p_artur),
    (g18, p_vlad,      'witch',          'witch',          'evil', 'evil', true, false, p_artur),
    (g18, p_ruslan,    'psychopath',     'psychopath',     'evil', 'evil', true, false, p_artur),
    (g18, p_maria,     'chef',           'chef',           'good', 'good', true, false, p_artur),
    (g18, p_bogdan,    'clockmaker',     'clockmaker',     'good', 'good', true, false, p_artur),
    (g18, p_oleg,      'dreamer',        'dreamer',        'good', 'good', true, false, p_artur),
    (g18, p_sergiy,    'seamstress',     'seamstress',     'good', 'good', true, false, p_artur),
    (g18, p_kateryna,  'philosopher',    'philosopher',    'good', 'good', true, false, p_artur),
    (g18, p_volodymyr, 'artist',         'artist',         'good', 'good', true, false, p_artur);

  -- -------------------------------------------------------
  -- g19: 2026-02-13 Game 2 (12 players, evil wins)
  -- -------------------------------------------------------
  INSERT INTO game_players (game_id, player_id, starting_role_id, ending_role_id, alignment_start, alignment_end, is_alive, is_mvp, added_by) VALUES
    (g19, p_vlad,      'legion',         'legion',         'evil', 'evil', true, false, p_artur),
    (g19, p_anya,      'mezepheles',     'mezepheles',     'evil', 'evil', true, false, p_artur),
    (g19, p_volodymyr, 'assassin',       'assassin',       'evil', 'evil', true, false, p_artur),
    (g19, p_kateryna,  'scarletwoman',   'scarletwoman',   'evil', 'evil', true, false, p_artur),
    (g19, p_viktoriya, 'juggler',        'juggler',        'good', 'good', true, false, p_artur),
    (g19, p_bogdan,    'sage',           'sage',           'good', 'good', true, false, p_artur),
    (g19, p_ruslan,    'tealady',        'tealady',        'good', 'good', true, false, p_artur),
    (g19, p_inna,      'recluse',        'recluse',        'good', 'good', true, false, p_artur),
    (g19, p_ira,       'oracle',         'oracle',         'good', 'good', true, false, p_artur),
    (g19, p_oleg,      'savant',         'savant',         'good', 'good', true, false, p_artur),
    (g19, p_illya,     'flowergirl',     'flowergirl',     'good', 'good', true, false, p_artur),
    (g19, p_maria,     'towncrier',      'towncrier',      'good', 'good', true, false, p_artur);

  -- -------------------------------------------------------
  -- g20: 2026-02-13 Game 3 (10 players, evil wins)
  -- -------------------------------------------------------
  INSERT INTO game_players (game_id, player_id, starting_role_id, ending_role_id, alignment_start, alignment_end, is_alive, is_mvp, added_by) VALUES
    (g20, p_maria,     'kazali',         'kazali',         'evil', 'evil', true, false, p_artur),
    (g20, p_volodymyr, 'devilsadvocate', 'devilsadvocate', 'evil', 'evil', true, false, p_artur),
    (g20, p_kateryna,  'mastermind',     'mastermind',     'evil', 'evil', true, false, p_artur),
    (g20, p_anya,      'snakecharmer',   'snakecharmer',   'good', 'good', true, false, p_artur),
    (g20, p_vlad,      'mathematician',  'mathematician',  'good', 'good', true, false, p_artur),
    (g20, p_ruslan,    'innkeeper',      'innkeeper',      'good', 'good', true, false, p_artur),
    (g20, p_inna,      'gambler',        'gambler',        'good', 'good', true, false, p_artur),
    (g20, p_oleg,      'exorcist',       'exorcist',       'good', 'good', true, false, p_artur),
    (g20, p_illya,     'fool',           'fool',           'good', 'good', true, false, p_artur),
    (g20, p_ira,       'drunk',          'drunk',          'good', 'good', true, false, p_artur);

  -- -------------------------------------------------------
  -- g21: 2026-02-22 Game 1 (7 players, evil wins)
  -- -------------------------------------------------------
  INSERT INTO game_players (game_id, player_id, starting_role_id, ending_role_id, alignment_start, alignment_end, is_alive, is_mvp, added_by) VALUES
    (g21, p_ira,       'ojo',            'ojo',            'evil', 'evil', true, false, p_artur),
    (g21, p_ruslan,    'eviltwin',       'eviltwin',       'evil', 'evil', true, false, p_artur),
    (g21, p_kateryna,  'grandmother',    'grandmother',    'good', 'good', true, false, p_artur),
    (g21, p_volodymyr, 'sailor',         'sailor',         'good', 'good', true, false, p_artur),
    (g21, p_bogdan,    'courtier',       'courtier',       'good', 'good', true, false, p_artur),
    (g21, p_yulya,     'professor',      'professor',      'good', 'good', true, false, p_artur),
    (g21, p_natali,    'chambermaid',    'chambermaid',    'good', 'good', true, false, p_artur);

  -- -------------------------------------------------------
  -- g22: 2026-02-22 Game 2 (8 players, good wins)
  -- -------------------------------------------------------
  INSERT INTO game_players (game_id, player_id, starting_role_id, ending_role_id, alignment_start, alignment_end, is_alive, is_mvp, added_by) VALUES
    (g22, p_kateryna,  'imp',            'imp',            'evil', 'evil', true, false, p_artur),
    (g22, p_volodymyr, 'poisoner',       'poisoner',       'evil', 'evil', true, false, p_artur),
    (g22, p_ira,       'nightwatchman',  'nightwatchman',  'good', 'good', true, false, p_artur),
    (g22, p_ruslan,    'bountyhunter',   'bountyhunter',   'good', 'good', true, false, p_artur),
    (g22, p_bogdan,    'acrobat',        'acrobat',        'good', 'good', true, false, p_artur),
    (g22, p_yulya,     'pixie',          'pixie',          'good', 'good', true, false, p_artur),
    (g22, p_natali,    'huntsman',       'huntsman',       'good', 'good', true, false, p_artur),
    (g22, p_maria,     'choirboy',       'choirboy',       'good', 'good', true, false, p_artur);

  -- -------------------------------------------------------
  -- g23: 2026-02-22 Game 3 (11 players, good wins)
  -- -------------------------------------------------------
  INSERT INTO game_players (game_id, player_id, starting_role_id, ending_role_id, alignment_start, alignment_end, is_alive, is_mvp, added_by) VALUES
    (g23, p_bogdan,    'nodashii',       'nodashii',       'evil', 'evil', true, false, p_artur),
    (g23, p_ruslan,    'godfather',      'godfather',      'evil', 'evil', true, false, p_artur),
    (g23, p_maria,     'baron',          'baron',          'evil', 'evil', true, false, p_artur),
    (g23, p_ira,       'alchemist',      'alchemist',      'good', 'good', true, false, p_artur),
    (g23, p_kateryna,  'noble',          'noble',          'good', 'good', true, false, p_artur),
    (g23, p_nastya,    'cannibal',       'cannibal',       'good', 'good', true, false, p_artur),
    (g23, p_volodymyr, 'king',           'king',           'good', 'good', true, false, p_artur),
    (g23, p_sergiy,    'saint',          'saint',          'good', 'good', true, false, p_artur),
    (g23, p_yulya,     'knight',         'knight',         'good', 'good', true, false, p_artur),
    (g23, p_natali,    'steward',        'steward',        'good', 'good', true, false, p_artur),
    (g23, p_sasha,     'fisherman',      'fisherman',      'good', 'good', true, false, p_artur);

  -- -------------------------------------------------------
  -- g24: 2026-02-22 Game 4 (11 players, evil wins)
  -- -------------------------------------------------------
  INSERT INTO game_players (game_id, player_id, starting_role_id, ending_role_id, alignment_start, alignment_end, is_alive, is_mvp, added_by) VALUES
    (g24, p_yulya,     'leviathan',      'leviathan',      'evil', 'evil', true, false, p_artur),
    (g24, p_volodymyr, 'cerenovus',      'cerenovus',      'evil', 'evil', true, false, p_artur),
    (g24, p_nastya,    'pithag',         'pithag',         'evil', 'evil', true, false, p_artur),
    (g24, p_natali,    'balloonist',     'balloonist',     'good', 'good', true, false, p_artur),
    (g24, p_sasha,     'amnesiac',       'amnesiac',       'good', 'good', true, false, p_artur),
    (g24, p_maria,     'farmer',         'farmer',         'good', 'good', true, false, p_artur),
    (g24, p_ira,       'moonchild',      'moonchild',      'good', 'good', true, false, p_artur),
    (g24, p_kateryna,  'empath',         'empath',         'good', 'evil', true, false, p_artur),
    (g24, p_ruslan,    'fortuneteller',  'fortuneteller',  'good', 'good', true, false, p_artur),
    (g24, p_bogdan,    'mutant',         'mutant',         'good', 'good', true, false, p_artur),
    (g24, p_sergiy,    'undertaker',     'undertaker',     'good', 'good', true, false, p_artur);

  -- -------------------------------------------------------
  -- g25: 2026-03-01 Game 1 (8 players, evil wins)
  -- -------------------------------------------------------
  INSERT INTO game_players (game_id, player_id, starting_role_id, ending_role_id, alignment_start, alignment_end, is_alive, is_mvp, added_by) VALUES
    (g25, p_bogdan,    'riot',           'riot',           'evil', 'evil', true, false, p_artur),
    (g25, p_ira,       'witch',          'witch',          'evil', 'evil', true, false, p_artur),
    (g25, p_volodymyr, 'monk',           'monk',           'good', 'evil', true, false, p_artur),
    (g25, p_sergiy,    'ravenkeeper',    'ravenkeeper',    'good', 'good', true, false, p_artur),
    (g25, p_natali,    'virgin',         'virgin',         'good', 'good', true, false, p_artur),
    (g25, p_maria,     'slayer',         'slayer',         'good', 'evil', true, false, p_artur),
    (g25, p_nastya,    'soldier',        'soldier',        'good', 'good', true, false, p_artur),
    (g25, p_kateryna,  'mayor',          'mayor',          'good', 'good', true, false, p_artur);

  -- -------------------------------------------------------
  -- g26: 2026-03-01 Game 2 (8 players, good wins)
  -- -------------------------------------------------------
  INSERT INTO game_players (game_id, player_id, starting_role_id, ending_role_id, alignment_start, alignment_end, is_alive, is_mvp, added_by) VALUES
    (g26, p_sergiy,    'zombuul',        'zombuul',        'evil', 'evil', true, false, p_artur),
    (g26, p_kateryna,  'spy',            'spy',            'evil', 'evil', true, false, p_artur),
    (g26, p_nastya,    'washerwoman',    'washerwoman',    'good', 'good', true, false, p_artur),
    (g26, p_bogdan,    'librarian',      'librarian',      'good', 'good', true, false, p_artur),
    (g26, p_ira,       'investigator',   'investigator',   'good', 'good', true, false, p_artur),
    (g26, p_volodymyr, 'butler',         'butler',         'good', 'good', true, false, p_artur),
    (g26, p_natali,    'chef',           'chef',           'good', 'good', true, false, p_artur),
    (g26, p_maria,     'clockmaker',     'clockmaker',     'good', 'good', true, false, p_artur);

  -- -------------------------------------------------------
  -- g27: 2026-03-01 Game 3 (8 players, evil wins)
  -- -------------------------------------------------------
  INSERT INTO game_players (game_id, player_id, starting_role_id, ending_role_id, alignment_start, alignment_end, is_alive, is_mvp, added_by) VALUES
    (g27, p_ira,       'pukka',          'pukka',          'evil', 'evil', true, false, p_artur),
    (g27, p_nastya,    'fearmonger',     'fearmonger',     'evil', 'evil', true, false, p_artur),
    (g27, p_kateryna,  'dreamer',        'dreamer',        'good', 'evil', true, false, p_artur),
    (g27, p_bogdan,    'seamstress',     'seamstress',     'good', 'evil', true, false, p_artur),
    (g27, p_volodymyr, 'philosopher',    'philosopher',    'good', 'evil', true, false, p_artur),
    (g27, p_sergiy,    'artist',         'artist',         'good', 'evil', true, false, p_artur),
    (g27, p_natali,    'sweetheart',     'sweetheart',     'good', 'evil', true, false, p_artur),
    (g27, p_maria,     'juggler',        'juggler',        'good', 'evil', true, false, p_artur);

  -- -------------------------------------------------------
  -- g28: 2026-03-22 Game 1 (9 players, good wins)
  -- -------------------------------------------------------
  INSERT INTO game_players (game_id, player_id, starting_role_id, ending_role_id, alignment_start, alignment_end, is_alive, is_mvp, added_by) VALUES
    (g28, p_volodymyr, 'imp',            'imp',            'evil', 'evil', true, false, p_artur),
    (g28, p_bogdan,    'scarletwoman',   'scarletwoman',   'evil', 'evil', true, false, p_artur),
    (g28, p_kateryna,  'drunk',          'drunk',          'good', 'good', true, false, p_artur),
    (g28, p_vlad,      'recluse',        'recluse',        'good', 'good', true, false, p_artur),
    (g28, p_natali,    'sage',           'sage',           'good', 'good', true, false, p_artur),
    (g28, p_sergiy_o,  'tealady',        'tealady',        'good', 'good', true, false, p_artur),
    (g28, p_ivanka,    'oracle',         'oracle',         'good', 'good', true, false, p_artur),
    (g28, p_nastya,    'savant',         'savant',         'good', 'good', true, false, p_artur),
    (g28, p_artur,     'flowergirl',     'flowergirl',     'good', 'good', true, false, p_artur);

  -- -------------------------------------------------------
  -- g29: 2026-03-22 Game 2 (10 players, good wins)
  -- -------------------------------------------------------
  INSERT INTO game_players (game_id, player_id, starting_role_id, ending_role_id, alignment_start, alignment_end, is_alive, is_mvp, added_by) VALUES
    (g29, p_natali,    'po',             'po',             'evil', 'evil', true, false, p_artur),
    (g29, p_artur,     'assassin',       'assassin',       'evil', 'evil', true, false, p_artur),
    (g29, p_oleg,      'mastermind',     'mastermind',     'evil', 'evil', true, false, p_artur),
    (g29, p_sergiy_o,  'towncrier',      'towncrier',      'good', 'good', true, false, p_artur),
    (g29, p_ivanka,    'snakecharmer',   'snakecharmer',   'good', 'good', true, false, p_artur),
    (g29, p_nastya,    'mathematician',  'mathematician',  'good', 'good', true, false, p_artur),
    (g29, p_volodymyr, 'innkeeper',      'innkeeper',      'good', 'good', true, false, p_artur),
    (g29, p_bogdan,    'gambler',        'gambler',        'good', 'good', true, false, p_artur),
    (g29, p_kateryna,  'exorcist',       'exorcist',       'good', 'good', true, false, p_artur),
    (g29, p_vlad,      'fool',           'fool',           'good', 'good', true, false, p_artur);

  -- -------------------------------------------------------
  -- g30: 2026-03-22 Game 3 (9 players, good wins)
  -- -------------------------------------------------------
  INSERT INTO game_players (game_id, player_id, starting_role_id, ending_role_id, alignment_start, alignment_end, is_alive, is_mvp, added_by) VALUES
    (g30, p_ivanka,    'vortox',         'vortox',         'evil', 'evil', true, false, p_artur),
    (g30, p_nastya,    'devilsadvocate', 'devilsadvocate', 'evil', 'evil', true, false, p_artur),
    (g30, p_natali,    'goblin',         'goblin',         'evil', 'evil', true, false, p_artur),
    (g30, p_volodymyr, 'grandmother',    'grandmother',    'good', 'good', true, false, p_artur),
    (g30, p_bogdan,    'sailor',         'sailor',         'good', 'good', true, false, p_artur),
    (g30, p_kateryna,  'courtier',       'courtier',       'good', 'good', true, false, p_artur),
    (g30, p_vlad,      'professor',      'professor',      'good', 'good', true, false, p_artur),
    (g30, p_sergiy_o,  'barber',         'barber',         'good', 'good', true, false, p_artur),
    (g30, p_oleg,      'klutz',          'klutz',          'good', 'good', true, false, p_artur);

  -- -------------------------------------------------------
  -- g31: 2026-03-27 Game 1 (8 players, evil wins)
  -- -------------------------------------------------------
  INSERT INTO game_players (game_id, player_id, starting_role_id, ending_role_id, alignment_start, alignment_end, is_alive, is_mvp, added_by) VALUES
    (g31, p_inna,      'shabaloth',      'shabaloth',      'evil', 'evil', true, false, p_artur),
    (g31, p_nastya,    'nightwatchman',  'nightwatchman',  'good', 'evil', true, false, p_artur),
    (g31, p_anya,      'psychopath',     'psychopath',     'evil', 'evil', true, false, p_artur),
    (g31, p_vlad,      'bountyhunter',   'bountyhunter',   'good', 'good', true, false, p_artur),
    (g31, p_volodymyr, 'heretic',        'heretic',        'good', 'good', true, false, p_artur),
    (g31, p_bogdan,    'pixie',          'pixie',          'good', 'good', true, false, p_artur),
    (g31, p_ira,       'huntsman',       'huntsman',       'good', 'good', true, false, p_artur),
    (g31, p_ruslan,    'choirboy',       'choirboy',       'good', 'good', true, false, p_artur);

  -- -------------------------------------------------------
  -- g32: 2026-03-27 Game 2 (8 players, good wins)
  -- -------------------------------------------------------
  INSERT INTO game_players (game_id, player_id, starting_role_id, ending_role_id, alignment_start, alignment_end, is_alive, is_mvp, added_by) VALUES
    (g32, p_ruslan,    'lleech',         'lleech',         'evil', 'evil', true, false, p_artur),
    (g32, p_ira,       'mezepheles',     'mezepheles',     'evil', 'evil', true, false, p_artur),
    (g32, p_bogdan,    'noble',          'noble',          'good', 'evil', true, false, p_artur),
    (g32, p_inna,      'lunatic',        'lunatic',        'good', 'good', true, false, p_artur),
    (g32, p_anya,      'cannibal',       'cannibal',       'good', 'good', true, false, p_artur),
    (g32, p_nastya,    'king',           'king',           'good', 'good', true, false, p_artur),
    (g32, p_vlad,      'knight',         'knight',         'good', 'good', true, false, p_artur),
    (g32, p_volodymyr, 'steward',        'steward',        'good', 'good', true, false, p_artur);

  -- -------------------------------------------------------
  -- g33: 2026-03-27 Game 3 (10 players, evil wins)
  -- -------------------------------------------------------
  INSERT INTO game_players (game_id, player_id, starting_role_id, ending_role_id, alignment_start, alignment_end, is_alive, is_mvp, added_by) VALUES
    (g33, p_ruslan,    'vigormortis',    'vigormortis',    'evil', 'evil', true, false, p_artur),
    (g33, p_sasha,     'cerenovus',      'cerenovus',      'evil', 'evil', true, false, p_artur),
    (g33, p_nastya,    'pithag',         'pithag',         'evil', 'evil', true, false, p_artur),
    (g33, p_volodymyr, 'fisherman',      'fisherman',      'good', 'good', true, false, p_artur),
    (g33, p_vlad,      'balloonist',     'balloonist',     'good', 'good', true, false, p_artur),
    (g33, p_bogdan,    'amnesiac',       'amnesiac',       'good', 'good', true, false, p_artur),
    (g33, p_inna,      'farmer',         'farmer',         'good', 'good', true, false, p_artur),
    (g33, p_ira,       'empath',         'empath',         'good', 'good', true, false, p_artur),
    (g33, p_anya,      'fortuneteller',  'fortuneteller',  'good', 'good', true, false, p_artur),
    (g33, p_artem,     'undertaker',     'undertaker',     'good', 'good', true, false, p_artur);

  -- ============================================================
  -- RANDOMIZE is_alive based on realistic survival rates per role type
  -- demon ~30%, minion ~50%, townsfolk ~60%, outsider ~65%
  -- Uses md5 hash of (game_id + player_id) for deterministic randomness
  -- ============================================================
  UPDATE game_players gp
  SET is_alive = (
    ('x' || left(md5(gp.game_id::text || gp.player_id::text), 8))::bit(32)::int
    % 100
  ) < CASE
    WHEN r.type = 'demon'     THEN 30
    WHEN r.type = 'minion'    THEN 50
    WHEN r.type = 'townsfolk' THEN 60
    WHEN r.type = 'outsider'  THEN 65
    WHEN r.type = 'traveller' THEN 80
    ELSE 100
  END
  FROM roles r
  WHERE r.id = COALESCE(gp.ending_role_id, gp.starting_role_id);

  -- ============================================================
  -- STAGGER created_at so same-day games have proper order
  -- g1/g2 same day, g3/g4/g5 same day, etc.
  -- Each game gets +1 minute offset based on its position
  -- ============================================================
  UPDATE games SET created_at = (date::timestamp + interval '10 hours')
    WHERE id IN (g1, g3, g6, g8, g10, g12, g16, g18, g21, g25, g28, g31);
  UPDATE games SET created_at = (date::timestamp + interval '13 hours')
    WHERE id IN (g2, g4, g7, g9, g11, g13, g17, g19, g22, g26, g29, g32);
  UPDATE games SET created_at = (date::timestamp + interval '16 hours')
    WHERE id IN (g5, g14, g20, g23, g27, g30, g33);
  UPDATE games SET created_at = (date::timestamp + interval '19 hours')
    WHERE id IN (g15, g24);

  -- ============================================================
  -- BACKFILL games.mvp_player_id from game_players.is_mvp
  -- ============================================================
  UPDATE games g
  SET mvp_player_id = (
    SELECT gp.player_id
    FROM game_players gp
    WHERE gp.game_id = g.id AND gp.is_mvp = true
    LIMIT 1
  );

END $$;
