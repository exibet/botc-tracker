import { AUTH_EVENTS } from '#shared/constants'

export default defineNuxtPlugin(() => {
  const client = useSupabaseClient()
  const { clearProfile, loadProfile, profile } = useAuth()

  // Profile already loaded by server middleware → auth.server.ts plugin.
  // Client plugin only handles runtime auth changes.
  const { data: { subscription } } = client.auth.onAuthStateChange(
    async (event) => {
      if (event === AUTH_EVENTS.SIGNED_OUT) {
        clearProfile()
      }
      else if (event === AUTH_EVENTS.SIGNED_IN && !profile.value) {
        // Guard: SSR already resolved the profile on page load.
        // Only fetch on actual login (OAuth redirect to /confirm).
        await loadProfile()
      }
    },
  )

  // Refresh JWT on tab visibility change
  const handleVisibility = async () => {
    if (document.visibilityState === 'visible') {
      await client.auth.refreshSession()
    }
  }
  document.addEventListener('visibilitychange', handleVisibility)

  const nuxtApp = useNuxtApp()
  // @ts-expect-error app:unmount hook not in Nuxt types yet
  nuxtApp.hook('app:unmount', () => {
    subscription.unsubscribe()
    document.removeEventListener('visibilitychange', handleVisibility)
  })
})
