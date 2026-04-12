// UX only — Supabase RLS enforces real access control.
export default defineNuxtRouteMiddleware(async () => {
  const { isAuthenticated, waitForProfile } = useAuth()

  if (import.meta.client) await waitForProfile()

  if (!isAuthenticated.value) {
    return navigateTo('/')
  }
})
