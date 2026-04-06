-- ============================================
-- RLS Policies for all tables
-- ============================================

-- Helper: check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================
-- ROLES: everyone reads, admin manages
-- ============================================
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "roles_select" ON roles
  FOR SELECT USING (true);

CREATE POLICY "roles_admin_insert" ON roles
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "roles_admin_update" ON roles
  FOR UPDATE USING (is_admin());

CREATE POLICY "roles_admin_delete" ON roles
  FOR DELETE USING (is_admin());

-- ============================================
-- PROFILES: everyone reads, user updates own
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (id = auth.uid());

-- ============================================
-- GAMES: everyone reads, admin CRUD
-- ============================================
ALTER TABLE games ENABLE ROW LEVEL SECURITY;

CREATE POLICY "games_select" ON games
  FOR SELECT USING (true);

CREATE POLICY "games_admin_insert" ON games
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "games_admin_update" ON games
  FOR UPDATE USING (is_admin());

CREATE POLICY "games_admin_delete" ON games
  FOR DELETE USING (is_admin());

-- ============================================
-- GAME_PLAYERS: everyone reads,
--   player self-service, admin all
-- ============================================
ALTER TABLE game_players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "gp_select" ON game_players
  FOR SELECT USING (true);

-- Player can add themselves to a game
CREATE POLICY "gp_player_insert_self" ON game_players
  FOR INSERT WITH CHECK (
    player_id = auth.uid() AND added_by = auth.uid()
  );

-- Player can update their own entry
CREATE POLICY "gp_player_update_self" ON game_players
  FOR UPDATE USING (player_id = auth.uid());

-- Player can remove themselves from a game
CREATE POLICY "gp_player_delete_self" ON game_players
  FOR DELETE USING (player_id = auth.uid());

-- Admin can do everything
CREATE POLICY "gp_admin_insert" ON game_players
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "gp_admin_update" ON game_players
  FOR UPDATE USING (is_admin());

CREATE POLICY "gp_admin_delete" ON game_players
  FOR DELETE USING (is_admin());
