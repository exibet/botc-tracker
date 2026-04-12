-- ============================================
-- Fix S1: Prevent self-service role escalation
-- The old profiles_update_own policy allows users
-- to UPDATE any column, including `role` and `is_manual`.
-- Replace with a policy that ensures those fields stay unchanged.
-- ============================================

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND role IS NOT DISTINCT FROM (SELECT p.role FROM profiles p WHERE p.id = auth.uid())
    AND is_manual IS NOT DISTINCT FROM (SELECT p.is_manual FROM profiles p WHERE p.id = auth.uid())
  );

-- Admin can update any profile (including role changes)
CREATE POLICY "profiles_admin_update" ON profiles
  FOR UPDATE USING (is_admin());

-- ============================================
-- Fix S2: Revoke public access to transfer_player_history
-- This SECURITY DEFINER function should only be called
-- internally by link_manual_profile / unlink_profile.
-- ============================================

REVOKE EXECUTE ON FUNCTION transfer_player_history(UUID, UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION transfer_player_history(UUID, UUID) FROM anon;
REVOKE EXECUTE ON FUNCTION transfer_player_history(UUID, UUID) FROM authenticated;
