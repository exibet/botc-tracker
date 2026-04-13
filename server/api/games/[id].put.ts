import { serverSupabaseClient } from '#supabase/server'
import { UpdateGameSchema } from '~~/server/schemas/games'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'Game ID required' })
  }

  const body = await validateBody(event, UpdateGameSchema)
  const client = await serverSupabaseClient(event)

  const { data, error } = await client
    .from('games')
    .update(body)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw createError({ statusCode: 400, message: error.message })
  }

  return data
})
