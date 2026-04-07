-- Allow admin to create profiles for unregistered players
-- Drop FK constraint so profiles.id doesn't require auth.users entry
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_manual BOOLEAN NOT NULL DEFAULT false;

-- Allow admin to insert manual profiles
CREATE POLICY "profiles_admin_insert" ON profiles FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
