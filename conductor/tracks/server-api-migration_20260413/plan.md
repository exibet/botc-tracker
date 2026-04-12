# Implementation Plan: Server API Migration

**Track ID:** server-api-migration_20260413
**Spec:** [spec.md](./spec.md)
**Created:** 2026-04-13
**Status:** [ ] Not Started

## Overview

Migrate from direct client-side Supabase queries to typed Nuxt server API routes.
7 phases, each independently deployable. Detailed plan: `docs/SERVER_API_MIGRATION.md`.

## Phase 1: Foundation + Cached Read Endpoints

Setup shared infrastructure and migrate simplest endpoints (no auth needed).

### Tasks

- [ ] Task 1.1: Install `zod` dependency
- [ ] Task 1.2: Create `shared/constants.ts` — domain enums (SCRIPTS, ALIGNMENTS, GAME_STATUSES, etc.)
- [ ] Task 1.3: Create `shared/api.ts` — API path constants (API.GAMES, API.GAME(id), etc.)
- [ ] Task 1.4: Create `shared/fetch-keys.ts` — cache key constants (FETCH_KEY.GAMES, etc.)
- [ ] Task 1.5: Update `app/types/index.ts` — derive types from shared constants
- [ ] Task 1.6: Create `app/utils/api.ts` — `$api` wrapper with global error toast
- [ ] Task 1.7: Create `server/utils/auth.ts` — requireAuth, requireAdmin helpers
- [ ] Task 1.8: Create `server/utils/profile.ts` — shared getProfile() function
- [ ] Task 1.9: Create `GET /api/roles` — cached (1 hour), replaces `useRoles.initRoles`
- [ ] Task 1.10: Create `GET /api/stats` — cached (5 min), replaces `useGameStats.initStats`
- [ ] Task 1.11: Update `useRoles` composable — use `useFetch(API.ROLES)`
- [ ] Task 1.12: Update `useGameStats` composable — use `useFetch(API.STATS)`
- [ ] Task 1.13: Verify postgrest-js select parser works with inline string literals
- [ ] Task 1.14: Write tests for server routes (roles, stats) and updated composables
- [ ] Task 1.15: Remove `initRoles()`/`initStats()` calls from `app.vue`

### Verification

- [ ] Build passes (`npm run build`)
- [ ] All tests pass (`npm run test:run`)
- [ ] Lint passes (`npm run lint:check`)
- [ ] Roles page loads correctly (cached from server)
- [ ] Home page stats load correctly (cached from server)
- [ ] No `useSupabaseClient()` in useRoles or useGameStats

## Phase 2: Auth SSR + Player Profiles

Biggest UX impact — full SSR auth eliminates hydration flicker.

### Tasks

- [ ] Task 2.1: Create `server/middleware/auth.ts` — resolves profile into event.context on every SSR request
- [ ] Task 2.2: Create `app/plugins/auth.server.ts` — transfers SSR profile to client useState
- [ ] Task 2.3: Add `setProfile()` method to `useAuth` composable
- [ ] Task 2.4: Create `GET /api/auth/profile` — uses shared getProfile()
- [ ] Task 2.5: Simplify `auth.client.ts` — remove getUser() on load, remove profileReady/waitForProfile
- [ ] Task 2.6: Simplify `auth.ts` / `admin.ts` client middleware — remove waitForProfile()
- [ ] Task 2.7: Remove `ClientOnly` wrappers on auth-dependent UI (header, admin buttons)
- [ ] Task 2.8: Remove `profileReady` useState and all watchers
- [ ] Task 2.9: Create `GET /api/players/list` — replaces `usePlayers.initPlayers`
- [ ] Task 2.10: Create `GET /api/players` — leaderboard via RPC, replaces `usePlayersWithStats`
- [ ] Task 2.11: Create `GET /api/players/[id]` — profile + stats + game history, replaces `usePlayerStats`
- [ ] Task 2.12: Create `GET /api/players/[id]/recent` — last N games, replaces `usePlayerRecentGames`
- [ ] Task 2.13: Update `usePlayers`, `usePlayerStats`, `usePlayerRecentGames` composables
- [ ] Task 2.14: Remove `initPlayers()` call from `app.vue`
- [ ] Task 2.15: Write tests for auth middleware, auth plugin, profile endpoint, player endpoints
- [ ] Task 2.16: Write tests for updated composables

### Verification

- [ ] Build passes
- [ ] All tests pass
- [ ] SSR renders full auth UI (user name, admin buttons) — no flicker
- [ ] Login/logout works correctly (auth state listener)
- [ ] Player profile page loads with stats
- [ ] Leaderboard page loads
- [ ] Admin middleware redirects correctly without waitForProfile

## Phase 3: Games Read + Home

Migrate game listing and the complex home page endpoint.

### Tasks

- [ ] Task 3.1: Create `GET /api/games` — list finished games, replaces `useGames`
- [ ] Task 3.2: Create `GET /api/games/[id]` — game details + players + votes, replaces `useGameActions.getById`
- [ ] Task 3.3: Create `GET /api/home` — active games + recent + leaderboard (3 parallel queries)
- [ ] Task 3.4: Update `useGames` composable — use `useFetch(API.GAMES)`
- [ ] Task 3.5: Update `useGameActions.getById` — use `useFetch(API.GAME(id))`
- [ ] Task 3.6: Update `useHome` composable — use `useFetch(API.HOME)`
- [ ] Task 3.7: Write tests for games and home endpoints
- [ ] Task 3.8: Write tests for updated composables

### Verification

- [ ] Build passes
- [ ] All tests pass
- [ ] Games list page loads correctly
- [ ] Game detail page loads with players and votes
- [ ] Home page loads with all sections (active, recent, leaderboard)

## Phase 4: Game Mutations

Admin-only endpoints with Zod validation.

### Tasks

- [ ] Task 4.1: Create `server/schemas/games.ts` — CreateGameSchema, UpdateGameSchema (using shared constants)
- [ ] Task 4.2: Create `POST /api/games` — admin only, Zod validated
- [ ] Task 4.3: Create `PUT /api/games/[id]` — admin only, Zod validated
- [ ] Task 4.4: Create `DELETE /api/games/[id]` — admin only
- [ ] Task 4.5: Update `useGameActions` composable — use `$api` for all mutations
- [ ] Task 4.6: Add cache invalidation — refreshNuxtData(FETCH_KEY.GAMES) after mutations
- [ ] Task 4.7: Write tests — auth checks, Zod validation, CRUD operations
- [ ] Task 4.8: Write tests for updated composable

### Verification

- [ ] Build passes
- [ ] All tests pass
- [ ] Create game works (admin only)
- [ ] Update game status/winner works
- [ ] Delete game works
- [ ] Non-admin gets 403
- [ ] Invalid input gets 400 with Zod error details
- [ ] Toast shows on error automatically (via $api)

## Phase 5: Game Players Mutations

Most complex composable — optimistic updates, emit chain.

### Tasks

- [ ] Task 5.1: Create `server/schemas/game-players.ts` — AddGamePlayerSchema, UpdateGamePlayerSchema
- [ ] Task 5.2: Create `POST /api/game-players` — user auth, Zod validated, returns entry with joins
- [ ] Task 5.3: Create `PUT /api/game-players/[id]` — user auth, Zod validated, returns updated entry
- [ ] Task 5.4: Create `DELETE /api/game-players/[id]` — user auth
- [ ] Task 5.5: Update `useGamePlayers` composable — use `$api`, update local state from response
- [ ] Task 5.6: Simplify emit pattern — emits notify parent, data already updated from server response
- [ ] Task 5.7: Move `refreshFromGame` logic — server returns full game data on mutation
- [ ] Task 5.8: Write tests — auth, Zod validation, CRUD, self-vs-admin permissions
- [ ] Task 5.9: Write tests for updated composable and emit patterns

### Verification

- [ ] Build passes
- [ ] All tests pass
- [ ] Add player to game works (self + admin)
- [ ] Update player entry works (role change, alignment, alive status)
- [ ] Remove player works
- [ ] Non-owner non-admin gets 403
- [ ] Parent components update correctly after mutations

## Phase 6: Votes + Admin Player Management

Remaining mutation endpoints.

### Tasks

- [ ] Task 6.1: Create `server/schemas/votes.ts` — CastVoteSchema, DeleteVoteSchema
- [ ] Task 6.2: Create `server/schemas/players.ts` — CreateManualSchema, LinkProfileSchema, UnlinkProfileSchema
- [ ] Task 6.3: Create `POST /api/votes` — upsert MVP vote, returns updated votes array
- [ ] Task 6.4: Create `DELETE /api/votes` — remove vote
- [ ] Task 6.5: Create `POST /api/players/manual` — admin, create manual profile
- [ ] Task 6.6: Create `POST /api/players/link` — admin, link manual to auth profile (RPC)
- [ ] Task 6.7: Create `POST /api/players/unlink` — admin, unlink profile (RPC)
- [ ] Task 6.8: Update `useMvpVoting` composable — use `$api`, update votes from response
- [ ] Task 6.9: Update `usePlayers` composable — use `$api` for mutations
- [ ] Task 6.10: Write tests for all vote and player management endpoints
- [ ] Task 6.11: Write tests for updated composables

### Verification

- [ ] Build passes
- [ ] All tests pass
- [ ] Cast/remove MVP vote works
- [ ] Create manual player works (admin)
- [ ] Link/unlink profile works (admin)
- [ ] Vote tally updates correctly after voting

## Phase 7: Cleanup & Verification

Remove all legacy code and verify zero violations.

### Tasks

- [ ] Task 7.1: Delete `app/utils/queries.ts` (GAME_LIST_SELECT, GAME_DETAIL_SELECT, PROFILE_SELECT)
- [ ] Task 7.2: Remove all `useSupabaseClient()` from composables (keep only in auth.client.ts)
- [ ] Task 7.3: Remove `app.vue` init block (initRoles, initPlayers, initStats)
- [ ] Task 7.4: Update `.env.example` — document anon key, comment out service role key
- [ ] Task 7.5: Remove unused imports, dead types, legacy interfaces
- [ ] Task 7.6: Run verification greps — zero violations:
  - `grep -r "as any\|as unknown\|: any\|: unknown" app/` → nothing
  - `grep -r "as [A-Z]" app/` → nothing (no type casts)
  - `grep -rn "'/api/\|\"\/api\/" app/` → nothing (no hardcoded API paths)
  - `grep -rn "try {" app/composables/` → nothing (no manual error handling)
- [ ] Task 7.7: Run full test suite — verify 80%+ coverage
- [ ] Task 7.8: Run build, lint, typecheck
- [ ] Task 7.9: Manual smoke test — all pages, auth flow, CRUD operations, voting

### Verification

- [ ] All verification greps pass (zero violations)
- [ ] Test coverage 80%+
- [ ] Build passes
- [ ] Lint passes
- [ ] Full manual smoke test passes
- [ ] No `useSupabaseClient()` in composables (only auth.client.ts)
- [ ] No `ClientOnly` wrappers for auth UI
- [ ] No `waitForProfile` / `profileReady` references

## Final Verification

- [ ] All acceptance criteria from spec.md met
- [ ] Tests passing with 80%+ coverage
- [ ] Zero type casts in app/ directory
- [ ] Zero hardcoded strings
- [ ] SSR auth working (no hydration flicker)
- [ ] Ready for review

---

_Generated by Conductor. Tasks will be marked [~] in progress and [x] complete._
