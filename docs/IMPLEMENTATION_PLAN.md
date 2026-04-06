# Blood on the Clocktower Tracker — Implementation Plan

## Project Overview

A community website for tracking Blood on the Clocktower games, player statistics, and role catalog. Built for a small Ukrainian-speaking community (~8-15 regular players, up to 100 max) that plays every Sunday.

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Framework | **Nuxt 4** | Latest, SSR + SPA, file-based routing |
| UI Library | **PrimeVue 4** | Rich component set (DataTable, AutoComplete, Dialog, Chart) |
| Styling | **Tailwind CSS 4** | Utility-first, works with PrimeVue unstyled mode |
| Database | **Supabase** (PostgreSQL) | Free tier (500MB), built-in Auth, RLS, realtime |
| Auth | **Supabase Auth** (Google OAuth) | Simple, free, integrates with RLS |
| Linting | **@nuxt/eslint** (flat config) | Official Nuxt ESLint module, includes stylistic formatting (no Prettier needed) |
| Unit/Component Tests | **Vitest + @nuxt/test-utils + @vue/test-utils** | Native Vite ecosystem, fast, official Nuxt support |
| E2E Tests | **Playwright** | Fast, parallel, auto-wait, built-in test generator |
| Hosting | **Vercel** or **Cloudflare Pages** | Free tier, supports Nuxt SSR |
| Language | **TypeScript** | Type safety throughout |

---

## Authorization Model

### Roles

| Role | View stats | View games | Add self to game | Choose own role | Create game | Edit any record | Manage players |
|------|-----------|------------|-----------------|----------------|-------------|----------------|---------------|
| **Guest** (no login) | yes | yes | no | no | no | no | no |
| **Player** (logged in) | yes | yes | yes (self only) | yes (self only) | no | no | no |
| **Admin** | yes | yes | yes (anyone) | yes (anyone) | yes | yes | yes |

### Auth Flow
1. Google OAuth via Supabase Auth
2. On first login, a `profiles` row is created with `role = 'player'`
3. Admin role is assigned manually in Supabase dashboard (or via seed)
4. RLS policies enforce permissions at DB level

---

## Database Schema

### Table: `roles`
All official BotC roles, seeded from wiki data.

```sql
CREATE TABLE roles (
  id TEXT PRIMARY KEY,             -- matches source JSON id ("empath", "imp", etc.)
  name_en TEXT NOT NULL,           -- "Empath"
  name_ua TEXT NOT NULL,           -- "Емпат"
  description_en TEXT NOT NULL,    -- English ability text
  description_ua TEXT NOT NULL,    -- Ukrainian ability text
  type TEXT NOT NULL CHECK (type IN (
    'townsfolk', 'outsider', 'minion', 'demon', 'traveller', 'fabled'
  )),
  edition TEXT NOT NULL CHECK (edition IN (
    'tb', 'bmr', 'snv', 'experimental', 'ks', 'base3'
  )),
  image_url TEXT,                  -- remote_image URL from source JSON
  meta JSONB,                     -- firstNight, otherNight, setup, reminders, jinxes
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_roles_type ON roles(type);
CREATE INDEX idx_roles_edition ON roles(edition);
```

### Table: `profiles`
Extends Supabase auth.users with app-specific data.

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'player' CHECK (role IN ('player', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, nickname, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### Table: `games`
Each game session (event).

```sql
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  script TEXT NOT NULL CHECK (script IN (
    'trouble_brewing', 'bad_moon_rising', 'sects_and_violets', 'custom'
  )),
  custom_script_name TEXT,         -- only if script = 'custom'
  winner TEXT NOT NULL CHECK (winner IN ('good', 'evil')),
  storyteller_id UUID REFERENCES profiles(id),
  notes TEXT,
  player_count INT,                -- denormalized for quick display
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_games_date ON games(date DESC);
CREATE INDEX idx_games_script ON games(script);
```

### Table: `game_players`
Player participation in a game.

```sql
CREATE TABLE game_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES profiles(id),
  starting_role_id TEXT NOT NULL REFERENCES roles(id),
  ending_role_id TEXT REFERENCES roles(id),  -- null = same as starting
  alignment_start TEXT NOT NULL CHECK (alignment_start IN ('good', 'evil')),
  alignment_end TEXT CHECK (alignment_end IN ('good', 'evil')),  -- null = same
  is_alive BOOLEAN NOT NULL DEFAULT true,
  is_mvp BOOLEAN NOT NULL DEFAULT false,
  added_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(game_id, player_id)  -- one entry per player per game
);

CREATE INDEX idx_game_players_game ON game_players(game_id);
CREATE INDEX idx_game_players_player ON game_players(player_id);
CREATE INDEX idx_game_players_role ON game_players(starting_role_id);
```

### Row Level Security (RLS) Policies

```sql
-- ROLES table: everyone can read
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "roles_read" ON roles FOR SELECT USING (true);
CREATE POLICY "roles_admin" ON roles FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- PROFILES table: everyone can read, users can update own
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_read" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (id = auth.uid());

-- GAMES table: everyone can read, only admin can create/update/delete
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
CREATE POLICY "games_read" ON games FOR SELECT USING (true);
CREATE POLICY "games_admin_insert" ON games FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "games_admin_update" ON games FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "games_admin_delete" ON games FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- GAME_PLAYERS table: everyone reads; player adds self; admin does everything
ALTER TABLE game_players ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gp_read" ON game_players FOR SELECT USING (true);
CREATE POLICY "gp_player_insert_self" ON game_players FOR INSERT WITH CHECK (
  player_id = auth.uid() AND added_by = auth.uid()
);
CREATE POLICY "gp_player_update_self" ON game_players FOR UPDATE USING (
  player_id = auth.uid()
);
CREATE POLICY "gp_player_delete_self" ON game_players FOR DELETE USING (
  player_id = auth.uid()
);
CREATE POLICY "gp_admin_all" ON game_players FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
```

---

## Pages & Features

### 1. Home `/`
- Hero section with community name/branding
- Last game summary card (date, script, winner, player count)
- Quick stats: total games, total players, current MVP leader
- Top 5 leaderboard preview
- Next game announcement (optional)

**Components**: `HomeHero`, `LastGameCard`, `QuickStats`, `LeaderboardPreview`

### 2. Roles Catalog `/roles`
- Grid/list of all roles with icons
- Filter by: type (townsfolk/outsider/minion/demon), edition
- Search by name (UA or EN)
- Click → role detail card/dialog: full description, type, edition, stats (how many times played, win rate with this role)

**Components**: `RoleGrid`, `RoleCard`, `RoleDetailDialog`, `RoleFilter`
**PrimeVue**: `DataView`, `InputText` (search), `Select` (filters), `Dialog`

### 3. Games List `/games`
- Table/cards: date, script, winner badge, player count, storyteller
- Sort by date (default: newest first)
- Filter: script, winner, date range
- Admin: "Create Game" button

**Components**: `GamesList`, `GameCard`, `GamesFilter`
**PrimeVue**: `DataTable`, `Tag` (winner badge), `DatePicker` (filter), `Select`

### 4. Game Detail `/games/[id]`
- Header: date, script, winner, storyteller, notes
- Players table: nickname, starting role, ending role, alignment, alive/dead, MVP badge
- Authorized player (not in game yet): "Join Game" button → select role dialog
- Authorized player (already in game): "Edit My Entry" button
- Admin: inline edit all fields, add any player, delete entries

**Components**: `GameHeader`, `GamePlayersTable`, `JoinGameDialog`, `EditPlayerEntryDialog`
**PrimeVue**: `DataTable`, `AutoComplete` (role search), `Dialog`, `ToggleSwitch`

### 5. Create/Edit Game `/games/new`, `/games/[id]/edit` (admin only)
- Form: date, script, winner, storyteller (select from players), notes
- Players section: add players from profile list
- For each player: role selector (AutoComplete searching roles by name), alignment, alive, MVP
- Save → creates game + game_players records

**Components**: `GameForm`, `PlayerRoleSelector`
**PrimeVue**: `DatePicker`, `Select`, `AutoComplete`, `Textarea`, `Button`

### 6. Player Profile `/players/[id]`
- Header: nickname, avatar, member since
- Stats cards:
  - Total games played
  - Win rate (overall, as good, as evil)
  - Most played role (top 3)
  - MVP count
  - Current win/loss streak
  - Survival rate (% games alive at end)
- Game history table: date, role, alignment, alive, won, MVP
- Role breakdown chart (pie: roles played by type)

**Components**: `PlayerHeader`, `PlayerStats`, `PlayerGameHistory`, `PlayerRoleChart`
**PrimeVue**: `DataTable`, `Chart` (pie/bar), `Tag`

### 7. Leaderboard `/leaderboard`
- Tabs: by wins, by win %, by MVP count, by games played
- Min games threshold for win % (e.g., 5 games minimum)
- Separate rankings for good/evil alignment

**Components**: `LeaderboardTable`, `LeaderboardTabs`
**PrimeVue**: `Tabs`, `DataTable`

### 8. Players List `/players`
- Grid of all players with quick stats (games, win rate)
- Click → player profile

**Components**: `PlayersGrid`, `PlayerCard`

---

## Project Structure

```
botc-tracker/
├── app/
│   ├── app.vue
│   ├── pages/
│   │   ├── index.vue                  # Home
│   │   ├── roles/
│   │   │   └── index.vue              # Roles catalog
│   │   ├── games/
│   │   │   ├── index.vue              # Games list
│   │   │   ├── new.vue                # Create game (admin)
│   │   │   └── [id]/
│   │   │       ├── index.vue          # Game detail
│   │   │       └── edit.vue           # Edit game (admin)
│   │   ├── players/
│   │   │   ├── index.vue              # Players list
│   │   │   └── [id].vue              # Player profile
│   │   └── leaderboard.vue           # Leaderboard
│   ├── components/
│   │   ├── home/
│   │   │   ├── Hero.vue
│   │   │   ├── LastGameCard.vue
│   │   │   ├── QuickStats.vue
│   │   │   └── LeaderboardPreview.vue
│   │   ├── roles/
│   │   │   ├── RoleGrid.vue
│   │   │   ├── RoleCard.vue
│   │   │   ├── RoleDetailDialog.vue
│   │   │   └── RoleFilter.vue
│   │   ├── games/
│   │   │   ├── GameCard.vue
│   │   │   ├── GameForm.vue
│   │   │   ├── GamePlayersTable.vue
│   │   │   ├── JoinGameDialog.vue
│   │   │   └── PlayerRoleSelector.vue
│   │   ├── players/
│   │   │   ├── PlayerCard.vue
│   │   │   ├── PlayerStats.vue
│   │   │   ├── PlayerGameHistory.vue
│   │   │   └── PlayerRoleChart.vue
│   │   ├── leaderboard/
│   │   │   └── LeaderboardTable.vue
│   │   └── layout/
│   │       ├── AppHeader.vue
│   │       ├── AppSidebar.vue
│   │       └── AppFooter.vue
│   ├── composables/
│   │   ├── useAuth.ts                # Auth state + helpers
│   │   ├── useSupabase.ts            # Supabase client
│   │   ├── useRoles.ts               # Roles data + search
│   │   ├── useGames.ts               # Games CRUD
│   │   ├── useGamePlayers.ts         # Game players CRUD
│   │   ├── usePlayers.ts             # Players list + stats
│   │   └── useLeaderboard.ts         # Leaderboard queries
│   ├── layouts/
│   │   └── default.vue
│   ├── middleware/
│   │   ├── auth.ts                   # Require login
│   │   └── admin.ts                  # Require admin role
│   └── types/
│       └── index.ts                  # TypeScript interfaces
├── server/
│   └── api/                          # Server API routes (if needed)
├── scripts/
│   └── seed-roles.ts                 # Fetches JSON from GitHub, generates seed SQL
├── supabase/
│   ├── migrations/
│   │   ├── 001_create_roles.sql
│   │   ├── 002_create_profiles.sql
│   │   ├── 003_create_games.sql
│   │   ├── 004_create_game_players.sql
│   │   └── 005_rls_policies.sql
│   └── seed/
│       └── roles.sql                 # Generated by seed-roles.ts (~154 roles, UA + EN)
├── tests/
│   ├── unit/
│   │   ├── composables/
│   │   │   ├── useAuth.test.ts
│   │   │   ├── useRoles.test.ts
│   │   │   ├── useGames.test.ts
│   │   │   └── useLeaderboard.test.ts
│   │   └── utils/
│   │       └── stats.test.ts
│   ├── components/
│   │   ├── roles/
│   │   │   ├── RoleCard.test.ts
│   │   │   └── RoleFilter.test.ts
│   │   ├── games/
│   │   │   ├── GameCard.test.ts
│   │   │   └── GamePlayersTable.test.ts
│   │   └── players/
│   │       └── PlayerStats.test.ts
│   └── e2e/
│       ├── roles-catalog.spec.ts      # Browse roles, filter, search
│       ├── game-flow.spec.ts          # Admin creates game, player joins
│       ├── player-profile.spec.ts     # View stats, game history
│       └── auth.spec.ts              # Login, logout, permission checks
├── vitest.config.ts
├── playwright.config.ts
├── nuxt.config.ts
├── eslint.config.mjs
├── package.json
└── .env.example
```

---

## Role Data Source

### Primary: [json-on-the-clocktower](https://github.com/chizmeeple/json-on-the-clocktower)
URL: `https://raw.githubusercontent.com/chizmw/json-on-the-clocktower/main/data/generated/roles-combined.json`

**Why this source:**
- 178 roles with complete data (ability, team, edition, night order, reminders, image URLs, jinxes)
- Structured as `character_by_id` object — convenient for lookups
- Versioned (v0.0.29), trackable updates
- Includes `editions`, `teams`, `jinxes` as separate sections
- Used by multiple community tools

### Source JSON Structure (per role)
```json
{
  "id": "empath",
  "name": "Empath",
  "ability": "Each night, you learn how many of your 2 alive neighbours are evil.",
  "team": "townsfolk",
  "edition": "tb",
  "firstNight": 41,
  "firstNightReminder": "Show the finger signal (0, 1, 2)...",
  "otherNight": 60,
  "otherNightReminder": "Show the finger signal (0, 1, 2)...",
  "reminders": [],
  "remote_image": "https://raw.githubusercontent.com/...",
  "setup": false
}
```

### Role Counts by Edition
| Edition | Code | Count |
|---------|------|-------|
| Kickstarter | ks | 36 |
| Bad Moon Rising | bmr | 30 |
| Sects & Violets | snv | 28 |
| Experimental | experimental | 27 |
| Trouble Brewing | tb | 23 |
| Base 3 | base3 | 10 |
| **Total** | | **~154** (excluding 4 meta entries) |

### Role Counts by Team
| Team | Count |
|------|-------|
| Townsfolk | 50 |
| Outsider | 20 |
| Minion | 20 |
| Demon | 14 |
| Traveler | 15 |
| Fabled | 9 |

### Seed Process
1. Fetch JSON from GitHub raw URL at build/seed time
2. Filter out `_meta` entries (DAWN, DUSK, DEMON, MINION)
3. Map fields to our DB schema:
   - `name` → `name_en`
   - `ability` → `description_en`
   - `team` → `type`
   - `edition` → `edition`
   - `remote_image` → `image_url`
4. Generate `name_ua` and `description_ua` (AI-assisted translation, then manual review)
5. Insert into Supabase `roles` table
6. Store `firstNight`, `otherNight`, `setup`, `reminders` as JSONB `meta` column for future use

### Translation Approach
- English names/descriptions taken directly from JSON
- Ukrainian translations generated AI-assisted, manually reviewed
- Proper nouns transliterated: "Washerwoman" → "Прачка", "Imp" → "Імп"
- Seed script outputs a `roles-seed.sql` file that can be re-run

---

## Implementation Steps (Ordered)

### Step 1: Project Scaffold
```bash
npx nuxi@latest init botc-tracker
cd botc-tracker
# Core
npm install @primevue/nuxt-module @primevue/themes tailwindcss @nuxtjs/supabase
# Linting
npm install -D @nuxt/eslint
# Testing
npm install -D vitest @nuxt/test-utils @vue/test-utils happy-dom
npm install -D @playwright/test
npx playwright install
```

Config:
- `nuxt.config.ts`: PrimeVue module, Supabase module, Tailwind, ESLint module
- `eslint.config.mjs`: Nuxt flat config (extends `@nuxt/eslint-config/flat`)
- `vitest.config.ts`: environment `nuxt`, test paths
- `playwright.config.ts`: base URL, project browsers
- PrimeVue Aura theme (dark mode support)
- `.env.example` with Supabase URL + anon key

### ESLint Rules
```js
// eslint.config.mjs
import { createConfigForNuxt } from '@nuxt/eslint-config/flat'

export default createConfigForNuxt({
  features: {
    stylistic: {
      semi: false,
      quotes: 'single',
    },
    tooling: true,
  },
}).override('nuxt/rules', {
  rules: {
    'no-console': 'error',
    'vue/max-len': ['warn', { code: 100 }],
  },
})
```

### NPM Scripts
```json
{
  "scripts": {
    "dev": "nuxt dev",
    "build": "nuxt build",
    "lint": "eslint . --fix",
    "lint:check": "eslint .",
    "test": "vitest",
    "test:run": "vitest run",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "typecheck": "nuxt typecheck"
  }
}
```

### Step 2: Supabase Setup
- Create Supabase project (free tier)
- Run migrations (tables + indexes + triggers)
- Configure RLS policies
- Enable Google OAuth in Supabase dashboard
- Set redirect URLs

### Step 3: Seed Role Data
- Create `scripts/seed-roles.ts` — fetches JSON from `json-on-the-clocktower` GitHub
- Maps source fields → DB schema (name→name_en, ability→description_en, team→type, etc.)
- Generates UA translations (AI-assisted batch), outputs `supabase/seed/roles.sql`
- Stores night order, setup, reminders in `meta` JSONB column
- Filters out 4 `_meta` entries (DAWN, DUSK, DEMON, MINION)
- Run seed against Supabase (~154 roles)

### Step 4: Auth & Layout
- `useAuth.ts` composable (login, logout, current user, isAdmin)
- `default.vue` layout with header (nav, auth button) + main content
- `auth.ts` middleware (redirects to login)
- `admin.ts` middleware (checks admin role)
- Login page/dialog with Google OAuth button

### Step 5: Roles Catalog Page
- `/roles` page with `DataView` grid
- Filter by type + edition (`Select` dropdowns)
- Search by name (`InputText`)
- Role detail dialog with full description
- Stats per role (games played, win rate) — added later

### Step 6: Games CRUD
- `/games` list page with `DataTable`
- `/games/new` — admin-only form to create a game
- `/games/[id]` — game detail with players table
- `/games/[id]/edit` — admin edit form
- Role selector: `AutoComplete` searching roles table

### Step 7: Player Self-Service
- "Join Game" button on game detail (if logged in + not in game)
- Dialog: select starting role, alignment
- Player can edit own entry (role, alignment, alive, etc.)
- Admin override: can edit any player's entry

### Step 8: Player Profiles & Stats
- `/players` list with cards
- `/players/[id]` profile with stats
- Supabase SQL functions for aggregated stats:
  - `get_player_stats(player_id)` → win rate, games, MVP count, etc.
  - `get_player_role_distribution(player_id)` → role type breakdown

### Step 9: Leaderboard
- `/leaderboard` with tabs
- Supabase SQL function: `get_leaderboard(type, min_games)`
- Rankings: total wins, win %, MVP count, best as good/evil

### Step 10: Tests
- **Unit tests** for composables: `useAuth`, `useRoles`, `useGames`, `useLeaderboard`
- **Unit tests** for utility functions (stat calculations, data transforms)
- **Component tests** for key components: `RoleCard`, `RoleFilter`, `GameCard`, `PlayerStats`
  - Test props rendering, emit events, conditional display (admin vs player vs guest)
- **E2E tests** with Playwright:
  - `roles-catalog.spec.ts` — browse, filter by type/edition, search by name
  - `game-flow.spec.ts` — admin creates game → player joins → selects role → admin overrides
  - `player-profile.spec.ts` — view stats, game history, role breakdown
  - `auth.spec.ts` — login, logout, admin vs player permissions

### Step 11: Polish & Deploy
- Responsive design (mobile-friendly)
- Dark mode (PrimeVue theme toggle)
- Loading states, empty states, error handling
- SEO meta tags
- Deploy to Vercel with env vars

---

## Nice-to-Have (Future)

| Feature | Description |
|---------|-------------|
| **Achievements** | Badges like "First Win", "5 MVPs", "Played all TB roles" |
| **Win Streaks** | Current and longest win/loss streaks |
| **Head-to-Head** | Compare two players' stats |
| **Charts** | Win rate over time, role type distribution |
| **Telegram Bot** | Notify group when new game is created |
| **Game Photos** | Upload photos from game sessions |
| **Custom Scripts** | Create and save custom role scripts |
| **Season System** | Group games by seasons/periods with separate leaderboards |

---

## Environment Variables

```env
# .env.example
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key  # for server-side only
```

---

## Verification Checklist

- [ ] `npm run dev` starts without errors
- [ ] `npm run lint:check` passes with zero errors
- [ ] `npm run typecheck` passes
- [ ] `npm run test:run` — all unit & component tests pass
- [ ] `npm run test:e2e` — all E2E tests pass
- [ ] Supabase tables created with correct schema
- [ ] RLS policies: guest can read, player can add self, admin can do all
- [ ] Google OAuth login works
- [ ] Roles catalog shows all ~154 roles with UA+EN names
- [ ] Admin can create a game and add players
- [ ] Player can join a game and select their role
- [ ] Admin can override player entries
- [ ] Player profile shows correct statistics
- [ ] Leaderboard calculations are accurate
- [ ] Mobile responsive layout works
