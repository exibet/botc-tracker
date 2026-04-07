export default defineNuxtPlugin(async () => {
  const client = useSupabaseClient()
  const { loadProfile, clearProfile, profileReady } = useAuth()

  // Load profile for existing session on page load
  const { data: { session } } = await client.auth.getSession()
  if (session?.user) {
    await loadProfile(session.user.id)
  }
  else {
    // No session — mark as ready so confirm page doesn't hang
    profileReady.value = true
  }

  // React to future auth changes (login, logout, token refresh)
  client.auth.onAuthStateChange(async (event, newSession) => {
    if (event === 'SIGNED_OUT') {
      clearProfile()
    }
    else if (newSession?.user && event === 'SIGNED_IN') {
      await loadProfile(newSession.user.id)
    }
  })
})
