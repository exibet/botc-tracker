-- Create roles table for BotC role catalog
CREATE TABLE IF NOT EXISTS roles (
  id TEXT PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_ua TEXT NOT NULL,
  description_en TEXT NOT NULL,
  description_ua TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN (
    'townsfolk', 'outsider', 'minion', 'demon', 'traveller', 'fabled'
  )),
  edition TEXT NOT NULL CHECK (edition IN (
    'tb', 'bmr', 'snv', 'experimental', 'ks', 'base3'
  )),
  image_url TEXT,
  meta JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_roles_type ON roles(type);
CREATE INDEX IF NOT EXISTS idx_roles_edition ON roles(edition);
