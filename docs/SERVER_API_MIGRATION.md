# Server API Migration Plan

Migration from direct client-side Supabase queries to typed Nuxt server API routes.

## Goals

1. **Full type safety** — zero `as`, `any`, `unknown`, or manual type casts anywhere in client code
2. **Full SSR with auth** — server middleware resolves profile before render; no `ClientOnly` wrappers for auth UI, no `waitForProfile()`, no hydration flicker
3. **Zero hardcoded strings** — all API paths, cache keys, domain enums from shared constants
4. **Global error handling** — single `$api` wrapper for mutations, `error.vue` for reads, no try/catch in composables
5. **Input validation** — Zod schemas on all mutations, using shared enum constants
6. **Security** — Supabase anon key stays server-side, RLS as safety net
7. **Caching** — static data (roles, stats) cached at server level

## Architecture

### Before (current)

```
Browser  -->  useSupabaseClient()  -->  Supabase REST API
              ^                         ^
              anon key in browser       complex joins return `any`
              casts everywhere          no input validation
```

### After

```
Browser  -->  useFetch(API.*)  -->  server/api/*.ts  -->  Supabase REST API
              $api(API.*)          ^                      ^
              ^                    Zod validation          user token forwarded
              fully typed via      single cast point       RLS enforced
              return type inference
```

## Auth Strategy

**User Token + RLS** for all endpoints.

- `serverSupabaseClient(event)` — creates Supabase client with the user's JWT from cookie
- `serverSupabaseUser(event)` — extracts user info from JWT
- RLS policies remain active as the security boundary
- Service role reserved for future server-only features (Telegram bot, cron jobs)

### Server utils

```ts
// server/utils/profile.ts — shared profile loader (used by middleware + API route)
export async function getProfile(event: H3Event) {
  const user = await serverSupabaseUser(event)
  if (!user) return null
  const client = await serverSupabaseClient(event)
  const { data } = await client
    .from('profiles')
    .select('id, nickname, avatar_url, role, is_manual')
    .eq('id', user.id)
    .single()
  return data
}
```

```ts
// server/utils/auth.ts — auth guards for API routes
export async function requireAuth(event: H3Event) {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ status: 401, message: 'Unauthorized' })
  return user
}

export async function requireAdmin(event: H3Event) {
  const user = await requireAuth(event)
  const client = await serverSupabaseClient(event)
  const { data } = await client.from('profiles').select('role').eq('id', user.id).single()
  if (data?.role !== 'admin') throw createError({ status: 403, message: 'Forbidden' })
  return user
}
```

### SSR auth middleware

Resolves the user profile during SSR so pages render with full auth state:

```ts
// server/middleware/auth.ts — runs on every request before page render
export default defineEventHandler(async (event) => {
  event.context.profile = await getProfile(event)
})
```

```ts
// server/api/auth/profile.get.ts — reuses same function
export default defineEventHandler(async (event) => {
  const profile = await getProfile(event)
  if (!profile) throw createError({ status: 401 })
  return profile
})
```

```ts
// app/plugins/auth.server.ts — transfers SSR profile to client state
export default defineNuxtPlugin(() => {
  const event = useRequestEvent()
  const profile = event?.context?.profile ?? null
  if (profile) {
    const { setProfile } = useAuth()
    setProfile(profile)
  }
})
```

This eliminates:
- `ClientOnly` wrappers on auth-dependent UI (admin buttons, user name in header)
- `waitForProfile()` calls in client middleware
- Hydration flicker (skeleton → real UI)
- The `profileReady` flag and its watchers

## API Endpoints

### Games

| Method | Path | Auth | Description | Replaces |
|--------|------|------|-------------|----------|
| GET | `/api/games` | none | List finished games (paginated) | `useGames` |
| GET | `/api/games/[id]` | none | Game details + players + votes | `useGameActions.getById` |
| POST | `/api/games` | admin | Create game | `useGameActions.create` |
| PUT | `/api/games/[id]` | admin | Update game | `useGameActions.update` |
| DELETE | `/api/games/[id]` | admin | Delete game | `useGameActions.remove` |

### Home

| Method | Path | Auth | Description | Replaces |
|--------|------|------|-------------|----------|
| GET | `/api/home` | none | Active games + recent + leaderboard | `useHome` |

### Players

| Method | Path | Auth | Description | Replaces |
|--------|------|------|-------------|----------|
| GET | `/api/players` | none | Leaderboard (all players with stats) | `usePlayersWithStats` |
| GET | `/api/players/list` | none | Simple profiles list (for dropdowns) | `usePlayers.initPlayers` |
| GET | `/api/players/[id]` | none | Profile + full stats + game history | `usePlayerStats` |
| GET | `/api/players/[id]/recent` | none | Last N games for player | `usePlayerRecentGames` |
| POST | `/api/players/manual` | admin | Create manual profile | `usePlayers.createManual` |
| POST | `/api/players/link` | admin | Link manual to auth profile | `usePlayers.linkProfile` |
| POST | `/api/players/unlink` | admin | Unlink profile | `usePlayers.unlinkProfile` |

### Game Players

| Method | Path | Auth | Description | Replaces |
|--------|------|------|-------------|----------|
| POST | `/api/game-players` | user | Add player to game | `useGamePlayers.add` |
| PUT | `/api/game-players/[id]` | user | Update entry | `useGamePlayers.update` |
| DELETE | `/api/game-players/[id]` | user | Remove entry | `useGamePlayers.remove` |

### Votes

| Method | Path | Auth | Description | Replaces |
|--------|------|------|-------------|----------|
| POST | `/api/votes` | user | Cast/update MVP vote (upsert) | `useMvpVoting.castVote` |
| DELETE | `/api/votes` | user | Remove vote | `useMvpVoting.removeVote` |

### Static / Cached

| Method | Path | Auth | Cache | Description | Replaces |
|--------|------|------|-------|-------------|----------|
| GET | `/api/roles` | none | 1 hour | All roles | `useRoles.initRoles` |
| GET | `/api/stats` | none | 5 min | Global game stats | `useGameStats` |

### Auth

| Method | Path | Auth | Description | Replaces |
|--------|------|------|-------------|----------|
| GET | `/api/auth/profile` | user | Current user profile | `useAuth.loadProfile` |

## File Structure

```
shared/
  constants.ts                 -- domain enums (SCRIPTS, ALIGNMENTS, etc.)
  api.ts                       -- API path constants
  fetch-keys.ts                -- useFetch/refreshNuxtData cache keys
app/
  plugins/
    auth.server.ts             -- SSR: transfers profile from server context to client state
    auth.client.ts             -- Client: auth state listener, session refresh (simplified)
  utils/
    api.ts                     -- $api: global $fetch wrapper with error toast
server/
  middleware/
    auth.ts                    -- SSR: resolves profile into event.context
  utils/
    auth.ts                    -- requireAuth, requireAdmin guards
    profile.ts                 -- getProfile() shared by middleware + API route
  schemas/
    games.ts                   -- CreateGameSchema, UpdateGameSchema
    game-players.ts            -- AddGamePlayerSchema, UpdateGamePlayerSchema
    players.ts                 -- CreateManualSchema, LinkProfileSchema, etc.
    votes.ts                   -- CastVoteSchema, DeleteVoteSchema
  api/
    auth/
      profile.get.ts
    games/
      index.get.ts
      index.post.ts
      [id].get.ts
      [id].put.ts
      [id].delete.ts
    home.get.ts
    players/
      index.get.ts
      list.get.ts
      [id].get.ts
      [id]/
        recent.get.ts
      manual.post.ts
      link.post.ts
      unlink.post.ts
    game-players/
      index.post.ts
      [id].put.ts
      [id].delete.ts
    votes/
      index.post.ts
      index.delete.ts
    roles.get.ts
    stats.get.ts
```

## Shared Constants

All string literals used across server and client live in shared constants files.
Zero hardcoded strings in composables, server routes, or components.

### Domain enums

```ts
// shared/constants.ts
export const SCRIPTS = ['trouble_brewing', 'bad_moon_rising', 'sects_and_violets', 'custom'] as const
export const ALIGNMENTS = ['good', 'evil'] as const
export const WINNERS = ['good', 'evil'] as const
export const GAME_STATUSES = ['upcoming', 'in_progress', 'finished'] as const
export const USER_ROLES = ['player', 'admin'] as const
export const ROLE_TYPES = ['townsfolk', 'outsider', 'minion', 'demon', 'traveller', 'fabled'] as const
export const EDITIONS = ['tb', 'bmr', 'snv', 'experimental', 'ks', 'base3'] as const
```

Domain types in `app/types/index.ts` derive from these constants:

```ts
import { SCRIPTS, ALIGNMENTS, GAME_STATUSES, ... } from '~/shared/constants'

export type Script = typeof SCRIPTS[number]
export type Alignment = typeof ALIGNMENTS[number]
export type GameStatus = typeof GAME_STATUSES[number]
// etc.
```

### API paths

```ts
// shared/api.ts
export const API = {
  // Games
  GAMES:              '/api/games',
  GAME:         (id: string) => `/api/games/${id}` as const,

  // Home
  HOME:               '/api/home',

  // Players
  PLAYERS:            '/api/players',
  PLAYERS_LIST:       '/api/players/list',
  PLAYER:       (id: string) => `/api/players/${id}` as const,
  PLAYER_RECENT:(id: string) => `/api/players/${id}/recent` as const,
  PLAYER_MANUAL:      '/api/players/manual',
  PLAYER_LINK:        '/api/players/link',
  PLAYER_UNLINK:      '/api/players/unlink',

  // Game players
  GAME_PLAYERS:       '/api/game-players',
  GAME_PLAYER:  (id: string) => `/api/game-players/${id}` as const,

  // Votes
  VOTES:              '/api/votes',

  // Static / cached
  ROLES:              '/api/roles',
  STATS:              '/api/stats',

  // Auth
  AUTH_PROFILE:       '/api/auth/profile',
} as const
```

### Fetch cache keys (for refreshNuxtData)

```ts
// shared/fetch-keys.ts
export const FETCH_KEY = {
  HOME:               'home',
  GAMES:              'games',
  GAME:         (id: string) => `game-${id}`,
  PLAYERS_LIST:       'players-list',
  PLAYERS_LEADERBOARD:'players-leaderboard',
  PLAYER:       (id: string) => `player-${id}`,
  PLAYER_RECENT:(id: string) => `player-${id}-recent`,
  ROLES:              'roles',
  STATS:              'game-stats',
} as const
```

### Usage everywhere

```ts
// app/composables/useGames.ts — read data
import { API } from '~/shared/api'
import { FETCH_KEY } from '~/shared/fetch-keys'

const { data: games } = await useFetch(API.GAMES, { key: FETCH_KEY.GAMES })

// app/composables/useGameActions.ts — mutations
async function create(game: CreateGameInput) {
  return $api(API.GAMES, { method: 'POST', body: game })
}

async function remove(id: string) {
  await $api(API.GAME(id), { method: 'DELETE' })
  await refreshNuxtData(FETCH_KEY.GAMES)
}

// app/composables/usePlayerStats.ts — read data
const { data } = await useFetch(API.PLAYER(id), { key: FETCH_KEY.PLAYER(id) })
```

## Zod Schemas

All mutation endpoints validate input with Zod. Schemas use shared constants —
no hardcoded strings. Read endpoints validate query params.

```ts
// server/schemas/games.ts
import { z } from 'zod'
import { SCRIPTS, GAME_STATUSES, WINNERS } from '~/shared/constants'

export const CreateGameSchema = z.object({
  date: z.string().date(),
  script: z.enum(SCRIPTS),
  custom_script_name: z.string().max(100).nullable().optional(),
  storyteller_id: z.string().uuid().nullable().optional(),
  notes: z.string().max(1000).nullable().optional(),
  player_count: z.number().int().min(5).max(20).nullable().optional(),
})

export const UpdateGameSchema = CreateGameSchema.partial().extend({
  status: z.enum(GAME_STATUSES).optional(),
  winner: z.enum(WINNERS).nullable().optional(),
})
```

```ts
// server/schemas/game-players.ts
import { z } from 'zod'
import { ALIGNMENTS } from '~/shared/constants'

export const AddGamePlayerSchema = z.object({
  game_id: z.string().uuid(),
  player_id: z.string().uuid(),
  starting_role_id: z.string().nullable().optional(),
  ending_role_id: z.string().nullable().optional(),
  alignment_start: z.enum(ALIGNMENTS).nullable().optional(),
  alignment_end: z.enum(ALIGNMENTS).nullable().optional(),
  is_alive: z.boolean().nullable().optional(),
  is_mvp: z.boolean().optional(),
})

export const UpdateGamePlayerSchema = AddGamePlayerSchema
  .omit({ game_id: true, player_id: true })
  .partial()
```

```ts
// server/schemas/votes.ts
import { z } from 'zod'

export const CastVoteSchema = z.object({
  game_id: z.string().uuid(),
  candidate_id: z.string().uuid(),
})

export const DeleteVoteSchema = z.object({
  game_id: z.string().uuid(),
})
```

```ts
// server/schemas/players.ts
import { z } from 'zod'

export const CreateManualSchema = z.object({
  nickname: z.string().min(1).max(50).trim(),
})

export const LinkProfileSchema = z.object({
  manual_id: z.string().uuid(),
  auth_id: z.string().uuid(),
})

export const UnlinkProfileSchema = z.object({
  auth_id: z.string().uuid(),
  nickname: z.string().min(1).max(50),
})
```

## Example: Full Endpoint

```ts
// server/api/games/index.post.ts
import { CreateGameSchema } from '~/server/schemas/games'

export default defineEventHandler(async (event) => {
  const user = await requireAdmin(event)
  const body = await readValidatedBody(event, CreateGameSchema.parse)
  const client = await serverSupabaseClient(event)

  const { data, error } = await client
    .from('games')
    .insert({
      ...body,
      status: 'upcoming',
      created_by: user.id,
    })
    .select()
    .single()

  if (error) throw createError({ status: 400, message: error.message })
  return data
})
```

```ts
// app/composables/useGameActions.ts (after migration)
import { API } from '~/shared/api'
import { FETCH_KEY } from '~/shared/fetch-keys'

export function useGameActions() {
  async function create(game: CreateGameInput) {
    // Fully typed — return type inferred from server handler
    // Error toast shown automatically by $api wrapper
    return $api(API.GAMES, { method: 'POST', body: game })
  }
}
```

## Migration Order

Migrate in phases, each independently deployable. Both old (direct Supabase)
and new (server API) approaches can coexist during migration.

### Phase 1 — Foundation + Read-only cached endpoints

**Why first:** No auth complexity, easy to verify, immediate caching benefit.

1. Install `zod`
2. Create `shared/constants.ts` (domain enums)
3. Create `shared/api.ts` (API path constants)
4. Create `shared/fetch-keys.ts` (cache key constants)
5. Create `app/utils/api.ts` (`$api` wrapper with global error toast)
6. Create `server/utils/auth.ts` (requireAuth, requireAdmin)
7. `GET /api/roles` — cached, replaces `useRoles.initRoles`
8. `GET /api/stats` — cached, replaces `useGameStats.initStats`
9. Update `useRoles` and `useGameStats` composables to use `useFetch`

**Files created:** 3 shared + 1 app util + 3 server files, 2 composables updated
**Risk:** Low — read-only, no auth needed

### Phase 2 — Auth SSR + player profiles

1. Create `server/utils/profile.ts` (shared `getProfile()`)
2. Create `server/middleware/auth.ts` (resolves profile on every SSR request)
3. Create `app/plugins/auth.server.ts` (transfers SSR profile to client state)
4. `GET /api/auth/profile` — replaces `useAuth.loadProfile`
5. Simplify `auth.client.ts` — remove `getUser()` on load, remove `profileReady`/`waitForProfile`
6. Simplify `auth.ts` / `admin.ts` client middleware — remove `waitForProfile()`
7. Remove `ClientOnly` wrappers on auth-dependent UI
8. `GET /api/players/list` — replaces `usePlayers.initPlayers`
9. `GET /api/players` — replaces `usePlayersWithStats`
10. `GET /api/players/[id]` — replaces `usePlayerStats` (biggest composable, 208 lines)
11. `GET /api/players/[id]/recent` — replaces `usePlayerRecentGames`
12. Update composables to use `useFetch`

**Files created:** 8 server files + 1 plugin, 6 composables/plugins updated
**Risk:** Medium-High — auth SSR is the most impactful change; test thoroughly

### Phase 3 — Games read + home

1. `GET /api/games` — replaces `useGames`
2. `GET /api/games/[id]` — replaces `useGameActions.getById`
3. `GET /api/home` — replaces `useHome` (complex: 3 parallel queries)
4. Update composables

**Files created:** 3 server files, 3 composables updated
**Risk:** Medium — home endpoint combines multiple queries

### Phase 4 — Game mutations

1. `POST /api/games` — replaces `useGameActions.create`
2. `PUT /api/games/[id]` — replaces `useGameActions.update`
3. `DELETE /api/games/[id]` — replaces `useGameActions.remove`
4. Zod validation on all three
5. Update `useGameActions` composable

**Files created:** 3 server files + schema, 1 composable updated
**Risk:** Medium — admin-only, needs auth checks

### Phase 5 — Game players mutations

1. `POST /api/game-players` — replaces `useGamePlayers.add`
2. `PUT /api/game-players/[id]` — replaces `useGamePlayers.update`
3. `DELETE /api/game-players/[id]` — replaces `useGamePlayers.remove`
4. Zod validation
5. Update `useGamePlayers` composable
6. Move `refreshFromGame` logic server-side

**Files created:** 3 server files + schema, 1 composable updated
**Risk:** High — most complex composable, has optimistic updates

### Phase 6 — Votes + admin player management

1. `POST /api/votes` — replaces `useMvpVoting.castVote`
2. `DELETE /api/votes` — replaces `useMvpVoting.removeVote`
3. `POST /api/players/manual` — replaces `usePlayers.createManual`
4. `POST /api/players/link` — replaces `usePlayers.linkProfile`
5. `POST /api/players/unlink` — replaces `usePlayers.unlinkProfile`
6. Zod validation on all

**Files created:** 5 server files + schemas, 2 composables updated
**Risk:** Medium — votes have upsert logic, link/unlink use RPC

### Phase 7 — Cleanup & verification

1. Remove `GAME_LIST_SELECT`, `GAME_DETAIL_SELECT`, `PROFILE_SELECT` from `utils/queries.ts`
2. Remove direct `useSupabaseClient()` from composables (keep only in `auth.client.ts` for auth state)
3. Remove `@nuxtjs/supabase` client-side usage — keep module for `serverSupabaseClient` only
4. Remove `app.vue` init block (`initRoles`, `initPlayers`, `initStats`)
5. Update `.env.example`
6. **Verify zero violations in `app/` directory:**
   - `grep -r "as any\|as unknown\|: any\|: unknown" app/` → must return nothing
   - `grep -r "as [A-Z]" app/` → must return nothing (no type casts)
   - `grep -rn "'/api/\|\"\/api\/" app/` → must return nothing (no hardcoded API paths)
   - `grep -rn "try {" app/composables/` → must return nothing (no manual error handling)
   - All API paths use `API.*` from `shared/api.ts`
   - All cache keys use `FETCH_KEY.*` from `shared/fetch-keys.ts`
   - All domain enums use constants from `shared/constants.ts`

## Composable Changes Summary

After migration, composables become thin wrappers around `useFetch` / `$fetch`:

| Composable | Lines now | Lines after | Change |
|------------|-----------|-------------|--------|
| useHome | 71 | ~15 | `useFetch(API.HOME)` |
| useGames | 23 | ~10 | `useFetch(API.GAMES)` |
| useGameActions | 82 | ~30 | `$api` calls |
| useGamePlayers | 201 | ~80 | `$api` + local state |
| usePlayerStats | 208 | ~15 | `useFetch(API.PLAYER(id))` |
| usePlayerRecentGames | 97 | ~10 | `useFetch(API.PLAYER_RECENT(id))` |
| usePlayers | 97 | ~40 | `useFetch` + `$api` |
| useMvpVoting | 122 | ~60 | `$api` + local state |
| useAuth | 102 | ~60 | Simplified — SSR profile, no waitForProfile |
| useRoles | 77 | ~30 | `useFetch(API.ROLES)` |
| useGameStats | 45 | ~15 | `useFetch(API.STATS)` |

## Dependencies to Add

```bash
npm install zod
```

No other dependencies needed — `h3` (Nuxt server engine) has built-in
`readValidatedBody`, `readValidatedQuery`, `createError`, `defineCachedEventHandler`.

## Type Strategy

### Client side (app/)

Zero Supabase imports. All types come from server API return types automatically:

```ts
// app/composables/useGames.ts
import { API } from '~/shared/api'
import { FETCH_KEY } from '~/shared/fetch-keys'

const { data: games } = await useFetch(API.GAMES, { key: FETCH_KEY.GAMES })
// typeof games = Ref<GameWithDetails[] | null> — inferred from server handler return
// read errors handled by error.vue; mutations use $api with global toast
```

No `database.types.ts` imports, no casts, no `as`, no `any`, no `unknown`, no hardcoded strings.

### Server side (server/)

`database.types.ts` is used by `serverSupabaseClient()` for table-level typing.

For select queries with joins, **use string literals directly** (not variables) to enable
the built-in select query parser in `@supabase/postgrest-js@2.101`:

```ts
// server/api/games/index.get.ts

// BAD — parser can't infer type from a variable
const SELECT = `*, storyteller:profiles!storyteller_id(id, nickname)`
const { data } = await client.from('games').select(SELECT)  // → unknown

// GOOD — string literal enables type inference
const { data } = await client.from('games').select(`
  *, storyteller:profiles!storyteller_id(id, nickname)
`)  // → fully typed!
```

If the parser fails on complex joins (e.g. `!inner` hints), cast once in the server
handler and document why. The client never sees the cast.

### database.types.ts lifecycle

- Generated via `npm run db:types` after schema changes
- Used only in `server/` — never imported from `app/`
- Provides typing for: `.from()` table names, `.rpc()` args/returns, `.select('*')` rows
- `@nuxtjs/supabase` auto-detects it at `~/types/database.types.ts`

## Select Strings → Server Side

Select strings move from `utils/queries.ts` to server endpoints as **inline string literals**
(to enable the postgrest-js select query parser):

| Select constant | Used in | Moves to |
|----------------|---------|----------|
| `GAME_LIST_SELECT` | useGames, useHome | `server/api/games/index.get.ts`, `server/api/home.get.ts` |
| `GAME_DETAIL_SELECT` | useHome, useGameActions, useGamePlayers | `server/api/games/[id].get.ts`, `server/api/home.get.ts` |
| `PROFILE_SELECT` | useAuth, usePlayers | `server/api/auth/profile.get.ts`, `server/api/players/list.get.ts` |
| `SELECT_PLAYER_GAMES` | usePlayerStats | `server/api/players/[id].get.ts` |
| inline select | usePlayerRecentGames | `server/api/players/[id]/recent.get.ts` |

After all endpoints are migrated, `utils/queries.ts` is deleted.

## Error Handling

### Global error handler — single place, no try/catch in composables

```ts
// app/utils/api.ts
import type { FetchError } from 'ofetch'

export const $api: typeof $fetch = $fetch.create({
  onResponseError({ response }: { response: { _data?: { message?: string, statusMessage?: string } } }) {
    const data = response._data
    const message = data?.message ?? data?.statusMessage ?? 'Щось пішло не так'
    useAppToast().error(message)
  },
})
```

All composables use `$api` instead of `$fetch` — zero error handling code:

```ts
// app/composables/useGameActions.ts
import { API } from '~/shared/api'

async function create(game: CreateGameInput) {
  return $api(API.GAMES, { method: 'POST', body: game })
  // Error? → toast shown automatically. No try/catch needed.
}

async function remove(id: string) {
  await $api(API.GAME(id), { method: 'DELETE' })
  await refreshNuxtData(FETCH_KEY.GAMES)
}
```

For `useFetch` (read operations), errors are handled by Nuxt's built-in
error boundary (`error.vue`) — no toast needed. If the page can't load data,
the user sees the error page, not a toast over an empty screen.

### Server error responses

Server endpoints use `createError()` with structured messages:

```ts
// server/api/games/index.post.ts
if (error) {
  throw createError({
    status: 400,
    message: error.message,        // shown to user via global toast
    data: { code: error.code },    // machine-readable if client needs it
  })
}
```

### Error status codes

| Status | Meaning | When |
|--------|---------|------|
| 400 | Bad Request | Zod validation failed, Supabase constraint error |
| 401 | Unauthorized | No valid session (JWT missing/expired) |
| 403 | Forbidden | User lacks permission (not admin, not owner) |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate entry (e.g. vote already exists) |

### Zod validation errors

`readValidatedBody` automatically returns 400 with Zod error details.
No extra handling needed — h3 formats the response, `$api` shows the toast:

```json
{
  "statusCode": 400,
  "statusMessage": "Validation Error",
  "data": {
    "issues": [{ "path": ["script"], "message": "Invalid enum value" }]
  }
}
```

## Cache Invalidation

### Problem

After a mutation (`$fetch POST/PUT/DELETE`), cached `useFetch` data is stale.

### Strategy: mutation returns fresh data + manual refresh

```ts
import { API } from '~/shared/api'
import { FETCH_KEY } from '~/shared/fetch-keys'

// Pattern 1: Mutation returns updated entity → update local state
async function updateGame(id: string, updates: UpdateGameInput) {
  const updated = await $api(API.GAME(id), { method: 'PUT', body: updates })
  if (game.value) {
    game.value = { ...game.value, ...updated }
  }
}

// Pattern 2: Mutation affects list data → refresh via key
async function deleteGame(id: string) {
  await $api(API.GAME(id), { method: 'DELETE' })
  await refreshNuxtData(FETCH_KEY.GAMES)
}

// Pattern 3: Mutation affects multiple caches → targeted refresh
async function castVote(gameId: string, candidateId: string) {
  const result = await $api(API.VOTES, {
    method: 'POST',
    body: { game_id: gameId, candidate_id: candidateId },
  })
  votes.value = result.votes
  await refreshNuxtData(FETCH_KEY.STATS)
}
```

### useFetch keys (for refreshNuxtData)

All keys come from `FETCH_KEY` constant — no hardcoded strings:

| Constant | Value | API | Refresh after |
|----------|-------|-----|---------------|
| `FETCH_KEY.HOME` | `'home'` | `API.HOME` | game create/update/delete, vote |
| `FETCH_KEY.GAMES` | `'games'` | `API.GAMES` | game create/update/delete |
| `FETCH_KEY.GAME(id)` | `'game-{id}'` | `API.GAME(id)` | game update, player add/remove, vote |
| `FETCH_KEY.PLAYERS_LIST` | `'players-list'` | `API.PLAYERS_LIST` | player create, link/unlink |
| `FETCH_KEY.PLAYERS_LEADERBOARD` | `'players-leaderboard'` | `API.PLAYERS` | game finish, vote |
| `FETCH_KEY.PLAYER(id)` | `'player-{id}'` | `API.PLAYER(id)` | game finish (affects stats) |
| `FETCH_KEY.ROLES` | `'roles'` | `API.ROLES` | rarely (admin role management) |
| `FETCH_KEY.STATS` | `'game-stats'` | `API.STATS` | game finish |

### Mutation endpoints should return enough data

To minimize extra refetches, mutation endpoints return the updated entity:

| Endpoint | Returns |
|----------|---------|
| `POST /api/games` | Created game with details |
| `PUT /api/games/[id]` | Updated game with details |
| `POST /api/game-players` | Created entry with player + role joins |
| `PUT /api/game-players/[id]` | Updated entry with joins |
| `POST /api/votes` | Updated votes array for the game |

## Auth Plugin Changes

### Current: `auth.client.ts`

The plugin does three things:
1. Validates session on page load via `getUser()`
2. Listens to auth state changes via `onAuthStateChange()`
3. Refreshes session on tab visibility change

### After migration

Initial profile loading moves to **server middleware + server plugin** (see Auth Strategy above).
The client plugin is simplified — no more `getUser()` or `loadProfile()` on page load:

```ts
// auth.client.ts — after migration
export default defineNuxtPlugin(() => {
  const client = useSupabaseClient()
  const { clearProfile, refreshProfile } = useAuth()

  // Profile already loaded by server middleware → auth.server.ts plugin
  // Client plugin only handles runtime auth changes:

  // 1. Auth state listener — reacts to login/logout
  const { data: { subscription } } = client.auth.onAuthStateChange(
    async (event, session) => {
      if (event === 'SIGNED_OUT') {
        clearProfile()
      }
      else if (event === 'SIGNED_IN' && session?.user) {
        await refreshProfile()  // calls $api(API.AUTH_PROFILE)
      }
    },
  )

  // 2. Visibility listener — refreshes JWT for session keepalive
  const handleVisibility = async () => {
    if (document.visibilityState === 'visible') {
      await client.auth.refreshSession()
    }
  }
  document.addEventListener('visibilitychange', handleVisibility)

  // Cleanup
  const nuxtApp = useNuxtApp()
  nuxtApp.hook('app:unmount', () => {
    subscription.unsubscribe()
    document.removeEventListener('visibilitychange', handleVisibility)
  })
})
```

Key changes:
- **No `getUser()` on page load** — server middleware already resolved profile during SSR
- **No `profileReady` / `waitForProfile()`** — profile is available from first render
- `useSupabaseClient()` remains on the client **only for auth operations**
  (`signInWithOAuth`, `signOut`, `onAuthStateChange`, `refreshSession`)
- All data queries go through server API

## Client Middleware Changes

### Current

- `auth.ts` — redirects unauthenticated users, calls `waitForProfile()`
- `admin.ts` — redirects non-admins, calls `waitForProfile()`

### After migration

Simplified — no `waitForProfile()` needed because server middleware
already populated the profile during SSR:

```ts
// app/middleware/admin.ts — simplified
export default defineNuxtRouteMiddleware(() => {
  const { isAdmin } = useAuth()
  if (!isAdmin.value) return navigateTo('/')
})

// app/middleware/auth.ts — simplified
export default defineNuxtRouteMiddleware(() => {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated.value) return navigateTo('/')
})
```

`profileReady`, `waitForProfile()` — removed entirely.

## Global State (useState) Changes

### Stays in useState

| Key | Reason |
|-----|--------|
| `'auth-profile'` | Needed by middleware, header, across all pages |
| `'auth-loading'` | UI loading state during sign-in/sign-out |

`'auth-profile-ready'` — **removed**. No longer needed with SSR auth.

### Moves to useFetch (auto-cached by Nuxt)

| Key | Before | After |
|-----|--------|-------|
| `'roles'` | `useState` + manual init in `app.vue` | `useFetch(API.ROLES)` in composable |
| `'players'` | `useState` + manual init in `app.vue` | `useFetch(API.PLAYERS_LIST)` in composable |
| `'game-stats'` | `useState` + manual init in `app.vue` | `useFetch(API.STATS)` in composable |

`useFetch` already deduplicates requests and caches during SSR — no need for
manual `useState` + `initX()` pattern. The `app.vue` initialization block is removed.

### app.vue changes

```ts
// Before:
await Promise.all([
  initRoles(),
  initPlayers(),
  initStats(),
]).catch(() => {})

// After:
// Removed — each composable fetches its own data via useFetch on first use.
// SSR deduplication ensures no duplicate requests.
```

## .env.example

```bash
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
# Uncomment when adding server-only features (Telegram bot, cron):
# SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

The anon key is still needed — `@nuxtjs/supabase` uses it server-side for
`serverSupabaseClient()` (creates a client with user's JWT + anon key).
Service role key is not needed until server-only features are added.

## Emit/Event Pattern Migration

### Current: Component emits → parent refreshes

```
GamePlayersPanel
  → add player (Supabase insert)
  → refreshFromGame() (fetches full game)
  → emit('game-updated', game)
  → parent updates local game ref
  → emit('player-count-changed')
  → parent updates player count

MvpVotingSection
  → castVote (Supabase upsert)
  → emit('vote-changed')
  → parent calls refreshFromGame()
```

### After: Server returns fresh data → update local state

```
GamePlayersPanel
  → $api(API.GAME_PLAYERS, POST) → returns entry with joins
  → update local players array
  → emit('game-updated') with updated player count (from array length)

MvpVotingSection
  → $api(API.VOTES, POST) → returns updated votes array
  → update local votes ref
  → no parent refresh needed
```

Emits are simplified — they notify parents of state changes, but
the data is already updated from the server response. Parents no longer
need to re-fetch.

## Testing Strategy

### Server API tests (new)

Each endpoint gets integration tests using `$fetch` against the dev server:

```ts
// tests/server/games.test.ts
import { setup, $fetch } from '@nuxt/test-utils'
import { API } from '~/shared/api'
import { SCRIPTS } from '~/shared/constants'

describe(API.GAMES, () => {
  it('returns games list', async () => {
    const games = await $fetch(API.GAMES)
    expect(Array.isArray(games)).toBe(true)
  })

  it('rejects unauthenticated create', async () => {
    await expect($fetch(API.GAMES, {
      method: 'POST',
      body: { date: '2026-01-01', script: SCRIPTS[0] },
    })).rejects.toThrow(/401/)
  })

  it('validates input with Zod', async () => {
    await expect($fetch(API.GAMES, {
      method: 'POST',
      body: { date: 'not-a-date' },
      headers: { /* auth cookie */ },
    })).rejects.toThrow(/400/)
  })
})
```

### Existing tests

Component tests and composable tests remain. Mock `$fetch`/`useFetch` instead
of mocking Supabase client — simpler and more realistic.
