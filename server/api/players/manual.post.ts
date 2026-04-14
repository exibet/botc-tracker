import { serverSupabaseClient } from '#supabase/server'
import { CreateManualSchema } from '~~/server/schemas/players'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await validateBody(event, CreateManualSchema)
  const client = await serverSupabaseClient(event)

  const { data, error } = await client
    .from('profiles')
    .insert({
      nickname: body.nickname,
      is_manual: true,
    })
    .select('id')
    .single()

  if (error) {
    throw createError({ statusCode: 400, message: 'Не вдалося створити профіль' })
  }

  return data
})
