import type { H3Event } from 'h3'
import { vi } from 'vitest'

// ---------------------------------------------------------------------------
// Supabase client mock
// ---------------------------------------------------------------------------

export interface MockQueryResult<T = unknown> {
  data?: T
  error?: { message: string } | null
  count?: number | null
}

export type MockSupabaseClient = ReturnType<typeof createMockSupabaseClient>

export function createMockSupabaseClient<T = unknown>(result: MockQueryResult<T> = {}) {
  const response = {
    data: result.data ?? null as unknown,
    error: result.error ?? null,
    count: result.count ?? null,
  }

  const builder: Record<string, ReturnType<typeof vi.fn> | unknown> = {}
  const chain = ['select', 'insert', 'update', 'delete', 'upsert', 'eq', 'in', 'order', 'range', 'limit']
  for (const method of chain) {
    builder[method] = vi.fn(() => builder)
  }
  builder.single = vi.fn(() => Promise.resolve(response))
  builder.then = (resolve: (v: typeof response) => unknown) => Promise.resolve(response).then(resolve)

  return {
    from: vi.fn(() => builder),
    rpc: vi.fn(() => Promise.resolve(response)),
    __builder: builder,
    __response: response,
  }
}

// ---------------------------------------------------------------------------
// H3 event mock
// ---------------------------------------------------------------------------

export interface MockEventOptions {
  profile?: { id: string, role: string, [k: string]: unknown } | null
  query?: Record<string, unknown>
  body?: unknown
  params?: Record<string, string>
  method?: string
}

export function createMockEvent(opts: MockEventOptions = {}): H3Event {
  const event = {
    context: {
      getProfile: vi.fn(() => Promise.resolve(opts.profile ?? null)),
      params: opts.params ?? {},
      __profile: opts.profile ?? null,
    },
    method: opts.method ?? 'GET',
    _query: opts.query ?? {},
    _body: opts.body ?? null,
    node: { req: {}, res: {} },
  } as unknown as H3Event
  return event
}

// ---------------------------------------------------------------------------
// Guards — fail loudly if a real network call is attempted
// ---------------------------------------------------------------------------

function stubFetchGuard() {
  vi.stubGlobal('fetch', vi.fn((url: string) => {
    throw new Error(`REAL NETWORK CALL BLOCKED: ${url}`)
  }))
  vi.stubGlobal('$fetch', vi.fn((url: string) => {
    throw new Error(`REAL $fetch CALL BLOCKED: ${url}`)
  }))
}

// ---------------------------------------------------------------------------
// H3 + Nitro globals and server auto-imports
// ---------------------------------------------------------------------------

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function createHttpError(opts: { statusCode: number, message: string }) {
  const err = new Error(opts.message) as Error & { statusCode: number }
  err.statusCode = opts.statusCode
  return err
}

export interface ServerStubOptions {
  /** If provided, requireAuth returns this; otherwise throws 401. */
  authProfile?: { id: string, role: string, [k: string]: unknown } | null
}

function stubServerGlobals(opts: ServerStubOptions = {}) {
  // H3 handler wrappers — identity
  vi.stubGlobal('defineEventHandler', (fn: unknown) => fn)
  vi.stubGlobal('defineCachedEventHandler', (fn: unknown, _config?: unknown) => fn)

  // H3 request helpers
  vi.stubGlobal('createError', createHttpError)
  vi.stubGlobal('getQuery', (event: { _query: unknown }) => event._query)
  vi.stubGlobal('readBody', (event: { _body: unknown }) => Promise.resolve(event._body))
  vi.stubGlobal('getRouterParam', (event: { context: { params: Record<string, string> } }, name: string) =>
    event.context.params[name],
  )

  // Cache / storage
  vi.stubGlobal('useStorage', () => ({
    getKeys: vi.fn(() => Promise.resolve([])),
    removeItem: vi.fn(() => Promise.resolve()),
  }))

  // Project auto-imports
  vi.stubGlobal('requireAuth', async () => {
    if (opts.authProfile) return opts.authProfile
    throw createHttpError({ statusCode: 401, message: 'Unauthorized' })
  })
  vi.stubGlobal('requireAdmin', async () => {
    if (opts.authProfile?.role === 'admin') return opts.authProfile
    if (opts.authProfile) throw createHttpError({ statusCode: 403, message: 'Forbidden' })
    throw createHttpError({ statusCode: 401, message: 'Unauthorized' })
  })
  vi.stubGlobal('validateBody', async (event: { _body: unknown }) => event._body)
  vi.stubGlobal('requireUuidParam', (event: { context: { params: Record<string, string> } }, name: string) => {
    const value = event.context.params[name]
    if (!value || !UUID_RE.test(value)) {
      throw createHttpError({ statusCode: 400, message: `Невалідний ${name}` })
    }
    return value
  })
  vi.stubGlobal('parseLimit', (val: unknown, def = 10, max = 100) => {
    const n = Number(val)
    if (!Number.isFinite(n) || n < 1) return def
    return Math.min(Math.floor(n), max)
  })
  vi.stubGlobal('invalidateCache', vi.fn(async () => {}))
  vi.stubGlobal('CACHE_NAMES', {
    STATS: 'stats',
    ROLES: 'roles',
    PLAYERS_LEADERBOARD: 'players-leaderboard',
  })
  vi.stubGlobal('CACHE_TTL', {
    STATS: 86400,
    ROLES: 86400,
    PLAYERS_LEADERBOARD: 86400,
  })
}

// ---------------------------------------------------------------------------
// Composite setup — one-call bootstrap for server-route tests
// ---------------------------------------------------------------------------

/**
 * Wires all guards, globals, and Supabase mock in one call.
 * Returns the freshly created mock client.
 *
 * Usage:
 * ```
 * let client: ReturnType<typeof createMockSupabaseClient>
 * beforeEach(() => { client = setupServerMocks({ authProfile: ADMIN_PROFILE }) })
 * ```
 */
export function setupServerMocks(opts: ServerStubOptions = {}) {
  stubFetchGuard()
  stubServerGlobals(opts)
  // Dynamic import prevents circular type resolution between helper files.
  const stub = globalThis as { __supabaseMock?: { client: unknown, user: unknown } }
  if (stub.__supabaseMock) {
    stub.__supabaseMock.client = null
    stub.__supabaseMock.user = null
  }
  const mockClient = createMockSupabaseClient()
  if (!stub.__supabaseMock) stub.__supabaseMock = { client: null, user: null }
  stub.__supabaseMock.client = mockClient
  return mockClient
}

// ---------------------------------------------------------------------------
// Assertion helper
// ---------------------------------------------------------------------------

export async function expectHttpError(fn: () => Promise<unknown>, statusCode: number, messageMatch?: string | RegExp) {
  try {
    await fn()
    throw new Error(`Expected handler to throw ${statusCode}, but it resolved`)
  }
  catch (e) {
    const err = e as Error & { statusCode?: number }
    if (err.statusCode !== statusCode) {
      throw new Error(`Expected statusCode ${statusCode}, got ${err.statusCode}. Message: ${err.message}`)
    }
    if (messageMatch) {
      const matches = typeof messageMatch === 'string'
        ? err.message.includes(messageMatch)
        : messageMatch.test(err.message)
      if (!matches) {
        throw new Error(`Expected message to match ${messageMatch}, got: ${err.message}`)
      }
    }
  }
}
