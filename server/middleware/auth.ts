export default defineEventHandler((event) => {
  let profilePromise: ReturnType<typeof getProfile> | null = null

  event.context.getProfile = () => {
    if (!profilePromise) {
      profilePromise = getProfile(event)
    }
    return profilePromise
  }
})
