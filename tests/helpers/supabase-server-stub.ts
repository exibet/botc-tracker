// Stub for #supabase/server — state held on globalThis to avoid
// module duplication across Vite/Nitro module graphs during tests.

interface SupabaseMockState {
  client: unknown
  user: unknown
}

function getState(): SupabaseMockState {
  const g = globalThis as { __supabaseMock?: SupabaseMockState }
  if (!g.__supabaseMock) {
    g.__supabaseMock = { client: null, user: null }
  }
  return g.__supabaseMock
}

export function setSupabaseMock(opts: Partial<SupabaseMockState>) {
  const state = getState()
  if (opts.client !== undefined) state.client = opts.client
  if (opts.user !== undefined) state.user = opts.user
}

export function resetSupabaseMock() {
  const state = getState()
  state.client = null
  state.user = null
}

export const serverSupabaseClient = () => Promise.resolve(getState().client)
export const serverSupabaseUser = () => Promise.resolve(getState().user)
