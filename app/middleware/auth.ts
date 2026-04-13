// UX only — Supabase RLS enforces real access control.
export default defineNuxtRouteMiddleware(() => {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated.value) {
    return navigateTo('/')
  }
})
