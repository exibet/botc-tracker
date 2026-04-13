export default defineNuxtPlugin(() => {
  const event = useRequestEvent()
  const profile = event?.context?.profile ?? null
  if (profile) {
    const { setProfile } = useAuth()
    setProfile(profile)
  }
})
