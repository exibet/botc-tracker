import type { Profile } from '~/types'

export function useAuth() {
  const user = useSupabaseUser()
  const client = useSupabaseClient()

  const profile = useState<Profile | null>('auth-profile', () => null)
  const loading = useState('auth-loading', () => false)
  const profileReady = useState('auth-profile-ready', () => false)

  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => profile.value?.role === 'admin')

  async function loadProfile(userId: string) {
    loading.value = true
    try {
      const { data } = await client
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      profile.value = data as Profile | null
    }
    finally {
      loading.value = false
      profileReady.value = true
    }
  }

  function clearProfile() {
    profile.value = null
    profileReady.value = false
  }

  async function signInWithGoogle() {
    loading.value = true
    try {
      const { error } = await client.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/confirm`,
        },
      })
      if (error) throw error
    }
    finally {
      loading.value = false
    }
  }

  async function signOut() {
    loading.value = true
    try {
      const { error } = await client.auth.signOut()
      if (error) throw error
      clearProfile()
    }
    finally {
      loading.value = false
    }
  }

  return {
    user,
    profile,
    loading,
    profileReady,
    isAuthenticated,
    isAdmin,
    loadProfile,
    clearProfile,
    signInWithGoogle,
    signOut,
  }
}
