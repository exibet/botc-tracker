# Tests

## Структура

```
tests/
├── helpers/                 ← Shared infrastructure (DO NOT skip)
│   ├── server.ts            ← Mocks for Supabase + h3 + auto-imports
│   ├── supabase-server-stub.ts  ← Aliased to #supabase/server
│   └── fixtures.ts          ← Shared UUIDs and profile fixtures
├── unit/
│   ├── server/              ← API routes + utils  (node env, COVERAGE)
│   ├── app/utils/           ← Pure functions      (node env, COVERAGE)
│   ├── shared/              ← Constants, helpers  (node env, COVERAGE)
│   ├── composables/         ← Composables         (nuxt env)
│   └── middleware/          ← Route middleware    (nuxt env)
└── components/              ← Vue SFC tests       (nuxt env)
```

## Two-config split

`vitest.config.ts` defines two projects:

| Project | Env | Coverage | Tests |
|---------|-----|----------|-------|
| `node` | node | ✓ enabled | server/api, server/utils, app/utils, shared |
| `nuxt` | nuxt + happy-dom | ✗ blocked by @nuxt/test-utils | composables, middleware, components |

**Why split:** Nuxt env breaks coverage output for both v8 and istanbul providers (known limitation). Node env tests measure honest coverage; Nuxt env tests run but don't count toward gate.

## Running

```bash
npm test                 # all tests, watch mode
npm run test:run         # all tests, single run
npm run test:coverage    # node project + coverage gate (used by pre-commit)
npm run test:nuxt        # nuxt project only
```

## Pre-commit gate

`.husky/pre-commit` runs:
1. `lint-staged` (eslint --fix)
2. `npm run typecheck`
3. `npm run test:coverage` — fails commit if coverage drops below threshold

Coverage thresholds (in `vitest.config.ts`):
- lines / functions / statements: 70%
- branches: 65%

## Network safety

`stubFetchGuard()` (called inside `setupServerMocks()`) replaces `fetch` and `$fetch` with throwing stubs. Any accidental real HTTP call fails loudly with `REAL NETWORK CALL BLOCKED: <url>`.

`#supabase/server` is aliased to `tests/helpers/supabase-server-stub.ts` — so server handlers can never reach a real Supabase client. State lives on `globalThis` to avoid module duplication between Vite and Nitro graphs.

## Patterns

### Server route test (uses `setupServerMocks`)

```ts
import { beforeEach, describe, expect, it } from 'vitest'
import {
  createMockEvent,
  expectHttpError,
  setupServerMocks,
  type MockSupabaseClient,
} from '../../../../helpers/server'
import { ADMIN_PROFILE, USER_PROFILE, VALID_UUID } from '../../../../helpers/fixtures'

describe('PUT /api/something/[id]', () => {
  let client: MockSupabaseClient

  it('rejects non-admin users', async () => {
    setupServerMocks({ authProfile: USER_PROFILE })
    const { default: handler } = await import('~~/server/api/something/[id].put')
    await expectHttpError(
      () => handler(createMockEvent({ params: { id: VALID_UUID }, body: {} })),
      403,
    )
  })

  describe('as admin', () => {
    beforeEach(() => { client = setupServerMocks({ authProfile: ADMIN_PROFILE }) })

    it('updates and returns data', async () => {
      client.__response.data = { id: VALID_UUID }
      const { default: handler } = await import('~~/server/api/something/[id].put')
      const result = await handler(createMockEvent({
        params: { id: VALID_UUID },
        body: { name: 'X' },
      }))
      expect(result).toEqual({ id: VALID_UUID })
      expect(client.__builder.update).toHaveBeenCalledWith({ name: 'X' })
    })
  })
})
```

**What `setupServerMocks` does:** stubs h3 globals (`defineEventHandler`, `createError`, `getQuery`, `readBody`, `getRouterParam`), Nitro globals (`requireAuth`, `requireAdmin`, `validateBody`, `requireUuidParam`, `parseLimit`, `invalidateCache`, `CACHE_NAMES`), `useStorage`, and `fetch`/`$fetch` guard. Returns a fresh mock Supabase client wired into `serverSupabaseClient()`.

**Auth profile semantics:**
- `null` → `requireAuth` throws 401, `requireAdmin` throws 401
- `{ role: 'player' }` → `requireAuth` returns profile, `requireAdmin` throws 403
- `{ role: 'admin' }` → both return profile

### App utils test (pure function)

```ts
import { describe, expect, it } from 'vitest'
import { formatDate } from '~~/app/utils/date'

describe('formatDate', () => {
  it('formats valid date', () => {
    expect(formatDate('2026-01-15')).toBe('15.01.2026')
  })
})
```

No setup needed — pure functions, node env.

### Composable test (Nuxt env)

```ts
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

const { mockFetch, mockApi } = vi.hoisted(() => ({
  mockFetch: vi.fn(),
  mockApi: vi.fn(),
}))

vi.stubGlobal('$fetch', mockFetch)
vi.stubGlobal('$api', mockApi)
mockNuxtImport('$api', () => mockApi)

mockNuxtImport('useRoles', () => () => ({ roles: ref([]) }))

describe('useSomething', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('does X', async () => {
    mockApi.mockResolvedValue({ id: '1' })
    const { method } = useSomething()
    const result = await method()
    expect(result).toEqual({ id: '1' })
  })
})
```

**Why `vi.hoisted`:** `mockNuxtImport(...)` is hoisted to the top of the file at compile time, so it cannot reference `mockApi` defined with `const`. `vi.hoisted` runs the factory at hoist-time too, making the values available to other hoisted code.

**Why `vi.stubGlobal` AND `mockNuxtImport`:** depending on how source code accesses `$api` (direct global vs auto-import resolution), one or the other applies. Stubbing both is safe.

### Component test (Nuxt env, PrimeVue compatible)

```ts
import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import MyComponent from '~/components/MyComponent.vue'

describe('MyComponent', () => {
  it('emits update on click', async () => {
    const wrapper = await mountSuspended(MyComponent, {
      props: { value: 'initial' },
    })
    await wrapper.find('[data-testid="btn"]').trigger('click')
    expect(wrapper.emitted('update')).toBeTruthy()
  })
})
```

**Always use `mountSuspended` (not `mount`)** — components that use PrimeVue, Nuxt auto-imports, or async setup need the Nuxt context that `mountSuspended` provides.

## Convention checklist (per file)

- [ ] Imports use `~~/` for app code, relative path for helpers
- [ ] Auth profiles via fixtures (`ADMIN_PROFILE`, `USER_PROFILE`, `OTHER_USER_PROFILE`) — never inline `{ id: 'admin-id', ... }`
- [ ] UUIDs via fixtures (`VALID_UUID`, `INVALID_UUID`) — never inline literals
- [ ] Server tests call `setupServerMocks()` — never `stubFetchGuard()` etc directly
- [ ] Cache names via `CACHE_NAMES.X` — never literal `'players-leaderboard'`
- [ ] One `describe` per route/composable/function
- [ ] Test name describes behavior, not implementation (`returns 404 when not found`, not `calls .single()`)
- [ ] Generic error messages asserted (`'Не вдалося завантажити ігри'`) — verifies sanitization works

## What we test vs skip

### Tested (high ROI)
- **Server routes** — security boundary, auth, validation, DB error sanitization, IDOR ownership, cache invalidation
- **App utils** — pure logic (stats, date, gamePlayer, display, error, role-image)
- **Composables** — state machines, mutations, derivation, error handling
- **Form components with logic** — emit payloads, conditional behavior

### Skipped (low ROI)
- **Pure presentation components** — `StatCard`, `PlayerAvatar`, `RoleAvatar`, `AlignmentTag`, `WinStreakBadge`, `HeroStat`, `GoodEvilBar`, `AppFooter`. Visual regression testing (Storybook + Chromatic) would be a better fit.
- **Pages** — integration territory, covered by E2E
- **God components** — `EditEntryDialog` (497 lines), `GamePlayersPanel` (350 lines) need refactoring before testing makes sense

## Adding a new test

1. Pick the matching pattern above (server route / app util / composable / component)
2. Copy structure from a nearby file in the same category
3. For server routes — always start with auth tests, then validation, then happy path, then error
4. Run only your file: `npx vitest run path/to/your.test.ts`
5. Commit — pre-commit hook runs full suite + coverage gate
