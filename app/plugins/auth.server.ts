import type { Profile } from '#shared/types'

export default defineNuxtPlugin(async () => {
  const event = useRequestEvent()
  const getProfile: (() => Promise<Profile | null>) | undefined = event?.context?.getProfile
  if (!getProfile) return
  const profile = await getProfile()
  if (profile) {
    const { setProfile } = useAuth()
    setProfile(profile)
  }
})
