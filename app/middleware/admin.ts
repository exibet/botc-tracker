export default defineNuxtRouteMiddleware(() => {
  const { isAuthenticated, isAdmin } = useAuth()

  if (!isAuthenticated.value || !isAdmin.value) {
    return navigateTo('/')
  }
})
