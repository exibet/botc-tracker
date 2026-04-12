// UX only — hides admin pages from non-admins.
// NOT a security boundary. Supabase RLS enforces real access control.
// Any server/api routes MUST check permissions independently.
export default defineNuxtRouteMiddleware(async () => {
  const { isAuthenticated, isAdmin, waitForProfile } = useAuth()

  if (import.meta.client) await waitForProfile()

  if (!isAuthenticated.value || !isAdmin.value) {
    return navigateTo('/')
  }
})
