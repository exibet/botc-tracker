import { serverSupabaseClient } from '#supabase/server'
import { UnlinkProfileSchema } from '~~/server/schemas/players'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await validateBody(event, UnlinkProfileSchema)
  const client = await serverSupabaseClient(event)

  const { data, error } = await client.rpc('unlink_profile', {
    auth_id: body.auth_id,
    manual_nickname: body.nickname,
  })

  if (error) {
    throw createError({ statusCode: 400, message: 'Не вдалося від\'єднати профіль' })
  }

  return { manualId: data }
})
