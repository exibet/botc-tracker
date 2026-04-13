import type { Profile } from '~/types'
import { API } from '#shared/api'

export function useAuth() {
  const user = useSupabaseUser()
  const client = useSupabaseClient()

  const profile = useState<Profile | null>('auth-profile', () => null)
  const loading = useState('auth-loading', () => false)

  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => profile.value?.role === 'admin')

  function setProfile(p: Profile | null) {
    profile.value = p
  }

  async function loadProfile() {
    loading.value = true
    try {
      profile.value = await $fetch<Profile>(API.AUTH_PROFILE)
        .catch(() => null)
    }
    finally {
      loading.value = false
    }
  }

  function clearProfile() {
    profile.value = null
  }

  async function signInWithGoogle() {
    loading.value = true
    try {
      const returnPath = useRoute().fullPath
      const redirectTo = `${window.location.origin}/confirm`
        + `?returnTo=${encodeURIComponent(returnPath)}`

      const { error } = await client.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo },
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
    isAuthenticated,
    isAdmin,
    setProfile,
    loadProfile,
    clearProfile,
    signInWithGoogle,
    signOut,
  }
}
