export default defineEventHandler(async (event) => {
  event.context.profile = await getProfile(event)
})
