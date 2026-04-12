-- Composite index for the most common query pattern:
-- WHERE status = '...' ORDER BY date DESC
CREATE INDEX IF NOT EXISTS idx_games_status_date
  ON games(status, date DESC);
