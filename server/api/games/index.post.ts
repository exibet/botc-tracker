import { serverSupabaseClient } from '#supabase/server'
import { CreateGameSchema } from '~~/server/schemas/games'

export default defineEventHandler(async (event) => {
  const user = await requireAdmin(event)
  const body = await validateBody(event, CreateGameSchema)
  const client = await serverSupabaseClient(event)

  const { data, error } = await client
    .from('games')
    .insert({
      ...body,
      status: 'upcoming',
      created_by: user.sub,
    })
    .select()
    .single()

  if (error) {
    throw createError({ statusCode: 400, message: 'Не вдалося створити гру' })
  }

  return data
})
