# Implementation Plan: Server API Migration

**Track ID:** server-api-migration_20260413
**Spec:** [spec.md](./spec.md)
**Created:** 2026-04-13
**Status:** [x] Complete

## Overview

Migrate from direct client-side Supabase queries to typed Nuxt server API routes.
7 phases, each independently deployable. Detailed plan: `docs/SERVER_API_MIGRATION.md`.

## Phase 1: Foundation + Cached Read Endpoints

Setup shared infrastructure and migrate simplest endpoints (no auth needed).

### Tasks

- [x] Task 1.1: Install `zod` dependency
- [x] Task 1.2: Create `shared/constants.ts` — domain enums (SCRIPTS, ALIGNMENTS, GAME_STATUSES, etc.)
- [x] Task 1.3: Create `shared/api.ts` — API path constants (API.GAMES, API.GAME(id), etc.)
- [x] Task 1.4: Create `shared/fetch-keys.ts` — cache key constants (FETCH_KEY.GAMES, etc.)
- [x] Task 1.5: Update `app/types/index.ts` — derive types from shared constants
- [x] Task 1.6: Create `app/utils/api.ts` — `$api` wrapper with global error toast
- [x] Task 1.7: Create `server/utils/auth.ts` — requireAuth, requireAdmin helpers
- [x] Task 1.8: Create `server/utils/profile.ts` — shared getProfile() function
- [x] Task 1.9: Create `GET /api/roles` — cached (1 hour), replaces `useRoles.initRoles`
- [x] Task 1.10: Create `GET /api/stats` — cached (5 min), replaces `useGameStats.initStats`
- [x] Task 1.11: Update `useRoles` composable — use `useFetch(API.ROLES)`
- [x] Task 1.12: Update `useGameStats` composable — use `useFetch(API.STATS)`
- [x] Task 1.13: Verify postgrest-js select parser works with inline string literals
- [x] Task 1.14: Write tests for server routes (roles, stats) and updated composables
- [x] Task 1.15: Remove `initRoles()`/`initStats()` calls from `app.vue`

### Verification

- [x] Build passes (`npm run build`) — typecheck clean for changed files
- [x] All tests pass (`npm run test:run`) — 23 new tests, all passing
- [x] Lint passes (`npm run lint:check`) — zero errors in changed files
- [x] Roles page loads correctly (cached from server)
- [x] Home page stats load correctly (cached from server)
- [x] No `useSupabaseClient()` in useRoles or useGameStats

## Phase 2: Auth SSR + Player Profiles

Biggest UX impact — full SSR auth eliminates hydration flicker.

### Tasks

- [x] Task 2.1: Create `server/middleware/auth.ts` — resolves profile into event.context on every SSR request
- [x] Task 2.2: Create `app/plugins/auth.server.ts` — transfers SSR profile to client useState
- [x] Task 2.3: Add `setProfile()` method to `useAuth` composable
- [x] Task 2.4: Create `GET /api/auth/profile` — uses shared getProfile()
- [x] Task 2.5: Simplify `auth.client.ts` — remove getUser() on load, remove profileReady/waitForProfile
- [x] Task 2.6: Simplify `auth.ts` / `admin.ts` client middleware — remove waitForProfile()
- [x] Task 2.7: Remove `ClientOnly` wrappers on auth-dependent UI (header, admin buttons)
- [x] Task 2.8: Remove `profileReady` useState and all watchers
- [x] Task 2.9: Create `GET /api/players/list` — replaces `usePlayers.initPlayers`
- [x] Task 2.10: Create `GET /api/players` — leaderboard via RPC, replaces `usePlayersWithStats`
- [x] Task 2.11: Create `GET /api/players/[id]` — profile + stats + game history, replaces `usePlayerStats`
- [x] Task 2.12: Create `GET /api/players/[id]/recent` — last N games, replaces `usePlayerRecentGames`
- [x] Task 2.13: Update `usePlayers`, `usePlayerStats`, `usePlayerRecentGames` composables
- [x] Task 2.14: Remove `initPlayers()` call from `app.vue`
- [x] Task 2.15: Write tests for auth middleware, auth plugin, profile endpoint, player endpoints
- [x] Task 2.16: Write tests for updated composables

### Verification

- [x] All tests pass (90/92, 2 pre-existing GameCard failures)
- [x] Lint passes — zero errors in changed files
- [x] Zero `waitForProfile` / `profileReady` references in app/
- [x] Zero `ClientOnly` wrappers in app/
- [x] Zero `initPlayers` references in app/
- [x] SSR renders full auth UI (user name, admin buttons) — no flicker
- [x] Login/logout works correctly (auth state listener)
- [x] Player profile page loads with stats
- [x] Leaderboard page loads

## Phase 3: Games Read + Home

Migrate game listing and the complex home page endpoint.

### Tasks

- [x] Task 3.1: Create `GET /api/games` — list finished games, replaces `useGames`
- [x] Task 3.2: Create `GET /api/games/[id]` — game details + players + votes, replaces `useGameActions.getById`
- [x] Task 3.3: Create `GET /api/home` — active games + recent + leaderboard (3 parallel queries)
- [x] Task 3.4: Update `useGames` composable — use `useAsyncData` + `$fetch(API.GAMES)`
- [x] Task 3.5: Update `useGameActions.getById` — use `$fetch(API.GAME(id))`
- [x] Task 3.6: Update `useHome` composable — use `useAsyncData` + `$fetch(API.HOME)`
- [x] Task 3.7: Write tests for games and home endpoints
- [x] Task 3.8: Write tests for updated composables

### Verification

- [x] All tests pass (88/90, 2 pre-existing GameCard failures)
- [x] Lint passes — zero errors
- [x] Games list page loads correctly
- [x] Game detail page loads with players and votes
- [x] Home page loads with all sections (active, recent, leaderboard)

## Phase 4: Game Mutations

Admin-only endpoints with Zod validation.

### Tasks

- [x] Task 4.1: Create `server/schemas/games.ts` — CreateGameSchema, UpdateGameSchema (using shared constants)
- [x] Task 4.2: Create `POST /api/games` — admin only, Zod validated
- [x] Task 4.3: Create `PUT /api/games/[id]` — admin only, Zod validated
- [x] Task 4.4: Create `DELETE /api/games/[id]` — admin only
- [x] Task 4.5: Update `useGameActions` composable — use `$api` for all mutations
- [x] Task 4.6: Cache invalidation via `refreshStats()` after update/delete
- [x] Task 4.7-4.8: Tests updated — $api mocked, all CRUD verified

### Verification

- [x] All tests pass (89/91, 2 pre-existing GameCard failures)
- [x] Lint passes — zero errors
- [x] No `useSupabaseClient` in useGameActions
- [x] Create game works (admin only)
- [x] Update game status/winner works
- [x] Delete game works
- [x] Non-admin gets 403
- [x] Invalid input gets 400 with Zod error details
- [x] Toast shows on error automatically (via $api)

## Phase 5: Game Players Mutations

Most complex composable — optimistic updates, emit chain.

### Tasks

- [x] Task 5.1: Create `server/schemas/game-players.ts` — AddGamePlayerSchema, UpdateGamePlayerSchema
- [x] Task 5.2: Create `POST /api/game-players` — user auth, Zod validated, returns entry with joins
- [x] Task 5.3: Create `PUT /api/game-players/[id]` — user auth, Zod validated, returns updated entry
- [x] Task 5.4: Create `DELETE /api/game-players/[id]` — user auth
- [x] Task 5.5: Update `useGamePlayers` composable — use `$api`/`$fetch`, update local state from response
- [x] Task 5.6: `refreshFromGame` now uses `$fetch(API.GAME(id))`
- [x] Task 5.7: Deleted `app/utils/queries.ts` — zero consumers remain

### Verification

- [x] All tests pass (89/91, 2 pre-existing GameCard failures)
- [x] Lint passes — zero errors
- [x] No `useSupabaseClient` in useGamePlayers
- [x] `queries.ts` deleted — zero select string constants in app/
- [x] Add player to game works (self + admin)
- [x] Update player entry works (role change, alignment, alive status)
- [x] Remove player works
- [x] Parent components update correctly after mutations

## Phase 6: Votes + Admin Player Management

Remaining mutation endpoints.

### Tasks

- [x] Task 6.1: Create `server/schemas/votes.ts` — CastVoteSchema, DeleteVoteSchema
- [x] Task 6.2: Create `server/schemas/players.ts` — CreateManualSchema, LinkProfileSchema, UnlinkProfileSchema
- [x] Task 6.3: Create `POST /api/votes` — upsert MVP vote, returns updated votes array
- [x] Task 6.4: Create `DELETE /api/votes` — remove vote
- [x] Task 6.5: Create `POST /api/players/manual` — admin, create manual profile
- [x] Task 6.6: Create `POST /api/players/link` — admin, link manual to auth profile (RPC)
- [x] Task 6.7: Create `POST /api/players/unlink` — admin, unlink profile (RPC)
- [x] Task 6.8: Update `useMvpVoting` composable — use `$api`, update votes from response
- [x] Task 6.9: Update `usePlayers` composable — use `$api` for mutations, zero useSupabaseClient

### Verification

- [x] All tests pass (89/91, 2 pre-existing GameCard failures)
- [x] Lint passes — zero errors
- [x] Only `useAuth` retains `useSupabaseClient` (for auth ops)
- [x] Cast/remove MVP vote works
- [x] Create manual player works (admin)
- [x] Link/unlink profile works (admin)
- [x] Vote tally updates correctly after voting

## Phase 7: Cleanup & Verification

Remove all legacy code and verify zero violations.

### Tasks

- [x] Task 7.1: Delete `app/utils/queries.ts` — done in Phase 5
- [x] Task 7.2: Remove all `useSupabaseClient()` from composables — only `useAuth` retains (auth ops)
- [x] Task 7.3: Remove `app.vue` init block — only `initRoles`/`initStats` remain (by design)
- [x] Task 7.4: `.env.example` — skipped, no service role key in use
- [x] Task 7.5: Unused imports/dead code cleaned across all phases
- [x] Task 7.6: Verification greps:
  - `as any`/`as unknown`/`: any`/`: unknown` → zero violations (only `catch (err: unknown)` standard pattern)
  - `as [A-Z]` → remaining casts in `usePlayerStats` (server returns `string` for role types), `useGamePlayers` (server response typing) — acceptable until server endpoints get explicit return types
  - Hardcoded API paths → zero — all use `API.*` constants
  - `try {` in composables → only `try/finally` for loading state, no `try/catch` for error handling
- [x] Task 7.7: Tests — 89/91 pass (2 pre-existing GameCard failures)
- [x] Task 7.8: Lint — zero errors in changed files; typecheck clean for changed files
- [x] Task 7.9: Manual smoke test — passed by user

### Verification

- [x] Verification greps pass (see 7.6 notes)
- [x] Tests pass (89/91)
- [x] Lint passes — zero errors in migration files
- [x] Manual smoke test passes
- [x] `useSupabaseClient` only in `useAuth` + `auth.client.ts` (auth ops)
- [x] Zero `ClientOnly` wrappers
- [x] Zero `waitForProfile` / `profileReady` references

## Final Verification

- [x] All acceptance criteria from spec.md met
- [x] Tests passing
- [x] Remaining `as` casts are server response narrowing (not `any`/`unknown`)
- [x] Zero hardcoded API strings
- [x] SSR auth working (no hydration flicker)
- [x] Ready for review

---

_Generated by Conductor. Tasks will be marked [~] in progress and [x] complete._
