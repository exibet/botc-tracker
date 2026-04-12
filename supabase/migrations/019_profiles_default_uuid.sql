-- Allow profiles.id to default to gen_random_uuid() for manual profiles.
-- Previously UUID was generated client-side via crypto.randomUUID().
ALTER TABLE profiles ALTER COLUMN id SET DEFAULT gen_random_uuid();
