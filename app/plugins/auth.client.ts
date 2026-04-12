export default defineNuxtPlugin(async () => {
  const client = useSupabaseClient()
  const { loadProfile, clearProfile, profileReady } = useAuth()

  // Load profile for existing session on page load (getUser() validates JWT server-side)
  const { data: { user } } = await client.auth.getUser()
  if (user) {
    await loadProfile(user.id)
  }
  else {
    profileReady.value = true
  }

  // React to all auth changes (login, logout, token refresh)
  const { data: { subscription } } = client.auth.onAuthStateChange(async (event, newSession) => {
    if (event === 'SIGNED_OUT') {
      clearProfile()
    }
    else if (
      newSession?.user
      && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')
    ) {
      if (!profileReady.value) {
        await loadProfile(newSession.user.id)
      }
    }
  })

  // Refresh Supabase session when tab becomes visible after inactivity
  const handleVisibility = async () => {
    if (document.visibilityState === 'visible') {
      const { data: { session: currentSession } }
        = await client.auth.getSession()
      if (currentSession) {
        await client.auth.refreshSession()
      }
      refreshNuxtData()
    }
  }
  document.addEventListener('visibilitychange', handleVisibility)

  // Cleanup on app unmount
  const nuxtApp = useNuxtApp()
  nuxtApp.hook('app:unmount', () => {
    subscription.unsubscribe()
    document.removeEventListener('visibilitychange', handleVisibility)
  })
})
