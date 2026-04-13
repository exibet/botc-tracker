export default defineEventHandler(async (event) => {
  const profile = await getProfile(event)
  if (!profile) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }
  return profile
})
