import { serverSupabaseClient } from '#supabase/server'
import { LinkProfileSchema } from '~~/server/schemas/players'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await validateBody(event, LinkProfileSchema)
  const client = await serverSupabaseClient(event)

  const { error } = await client.rpc('link_manual_profile', {
    manual_id: body.manual_id,
    auth_id: body.auth_id,
  })

  if (error) {
    throw createError({ statusCode: 400, message: error.message })
  }

  return { success: true }
})
