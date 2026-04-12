-- ============================================
-- Server-side aggregation for home stats and player leaderboard.
-- Eliminates unbounded client-side fetches of game_players.
-- ============================================

-- Quick counts for home page hero section
CREATE OR REPLACE FUNCTION get_home_stats()
RETURNS JSON
LANGUAGE sql STABLE SECURITY INVOKER
AS $$
  SELECT json_build_object(
    'totalGames',   (SELECT COUNT(*) FROM games WHERE status = 'finished'),
    'goodWins',     (SELECT COUNT(*) FROM games WHERE status = 'finished' AND winner = 'good'),
    'evilWins',     (SELECT COUNT(*) FROM games WHERE status = 'finished' AND winner = 'evil'),
    'totalPlayers', (SELECT COUNT(*) FROM profiles)
  );
$$;

-- Player leaderboard with stats and win streaks computed in Postgres.
-- Pass NULL for result_limit to return all players.
CREATE OR REPLACE FUNCTION get_player_leaderboard(result_limit INT DEFAULT NULL)
RETURNS TABLE (
  id           UUID,
  nickname     TEXT,
  avatar_url   TEXT,
  role         TEXT,
  is_manual    BOOLEAN,
  created_at   TIMESTAMPTZ,
  games_played BIGINT,
  wins         BIGINT,
  mvp_count    BIGINT,
  good_games   BIGINT,
  evil_games   BIGINT,
  points       NUMERIC,
  win_streak   BIGINT
)
LANGUAGE sql STABLE SECURITY INVOKER
AS $$
  WITH game_results AS (
    SELECT
      gp.player_id,
      gp.is_mvp,
      COALESCE(gp.alignment_end, gp.alignment_start) AS eff_align,
      COALESCE(er.type, sr.type)                      AS eff_role_type,
      g.winner,
      g.date,
      g.created_at
    FROM game_players gp
    JOIN games g      ON g.id  = gp.game_id
    LEFT JOIN roles sr ON sr.id = gp.starting_role_id
    LEFT JOIN roles er ON er.id = gp.ending_role_id
    WHERE g.status = 'finished' AND g.winner IS NOT NULL
  ),
  player_stats AS (
    SELECT
      player_id,
      COUNT(*)                                          AS games_played,
      COUNT(*) FILTER (WHERE eff_align = winner)        AS wins,
      COUNT(*) FILTER (WHERE is_mvp)                    AS mvp_count,
      COUNT(*) FILTER (WHERE eff_align = 'good')        AS good_games,
      COUNT(*) FILTER (WHERE eff_align = 'evil')        AS evil_games,
      SUM(CASE
        WHEN eff_align <> winner        THEN 0
        WHEN eff_role_type = 'demon'    THEN 2
        WHEN eff_role_type = 'minion'   THEN 1.5
        ELSE 1
      END)                                              AS points
    FROM game_results
    GROUP BY player_id
  ),
  -- Win streaks: count consecutive wins from most recent game
  numbered AS (
    SELECT
      player_id,
      (eff_align = winner) AS won,
      ROW_NUMBER() OVER (
        PARTITION BY player_id
        ORDER BY date DESC, created_at DESC
      ) AS rn
    FROM game_results
  ),
  streaks AS (
    SELECT
      player_id,
      COALESCE(
        MIN(rn) FILTER (WHERE NOT won) - 1,
        MAX(rn)
      ) AS win_streak
    FROM numbered
    GROUP BY player_id
  )
  SELECT
    p.id,
    p.nickname,
    p.avatar_url,
    p.role,
    p.is_manual,
    p.created_at,
    COALESCE(ps.games_played, 0),
    COALESCE(ps.wins, 0),
    COALESCE(ps.mvp_count, 0),
    COALESCE(ps.good_games, 0),
    COALESCE(ps.evil_games, 0),
    COALESCE(ps.points, 0),
    COALESCE(s.win_streak, 0)
  FROM profiles p
  LEFT JOIN player_stats ps ON ps.player_id = p.id
  LEFT JOIN streaks s       ON s.player_id  = p.id
  ORDER BY
    COALESCE(ps.points, 0) DESC,
    COALESCE(ps.games_played, 0) DESC,
    p.nickname
  LIMIT result_limit;
$$;
