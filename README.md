# BotC Tracker

Community game tracker for [Blood on the Clocktower](https://bloodontheclocktower.com/) — a social deduction board game.

Built for a Ukrainian-speaking community that plays regularly. Track games, player stats, roles, MVP votes, and more.

## Features

- **Games** — create, track, and browse game sessions with script, winner, and player details
- **Players** — profiles with win rates, points, MVP count, role distribution, and win streaks
- **Roles catalog** — all official BotC roles with Ukrainian translations, filterable by type and edition
- **MVP voting** — anonymous community voting for most valuable player each game
- **Leaderboard** — top players ranked by points and win rate
- **Auth** — Google OAuth, role-based access (guest / player / admin)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Nuxt 4 (SSR + SPA) |
| UI | PrimeVue 4 + Tailwind CSS 4 |
| Database | Supabase (PostgreSQL + Auth + RLS) |
| Auth | Google OAuth via Supabase |
| Testing | Vitest + Playwright |
| Hosting | Vercel |

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase project with Google OAuth configured

### Setup

```bash
npm install
```

Create `.env` from example:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
```

### Development

```bash
npm run dev
```

App runs at `http://localhost:3500`.

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run lint` | Lint and fix |
| `npm run test` | Unit tests (Vitest) |
| `npm run test:run` | Unit tests single run |
| `npm run test:e2e` | E2E tests (Playwright) |

## Project Structure

```
app/
  pages/           # File-based routing
  components/      # Vue components (games, players, roles, layout)
  composables/     # Reusable logic (useGames, usePlayers, useAuth, etc.)
  utils/           # Helpers (stats, queries, date formatting)
  types/           # TypeScript interfaces
  assets/css/      # Tailwind + custom styles
public/
  roles/           # Optimized role images (WebP)
supabase/
  migrations/      # DB schema
  seed/            # Role seed data (~154 roles)
tests/
  unit/            # Vitest unit tests
  components/      # Component tests
  e2e/             # Playwright E2E tests
```

## License

Private project for community use.
