import { serverSupabaseClient } from '#supabase/server'
import { UpdateGameSchema } from '~~/server/schemas/games'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const id = requireUuidParam(event, 'id')

  const body = await validateBody(event, UpdateGameSchema)
  const client = await serverSupabaseClient(event)

  const { data, error } = await client
    .from('games')
    .update(body)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw createError({ statusCode: 400, message: 'Не вдалося оновити гру' })
  }

  return data
})
