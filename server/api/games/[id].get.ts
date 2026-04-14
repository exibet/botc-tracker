import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const id = requireUuidParam(event, 'id')

  const client = await serverSupabaseClient(event)

  const { data, error } = await client
    .from('games')
    .select(GAME_WITH_DETAILS_SELECT)
    .eq('id', id)
    .single()

  if (error) {
    throw createError({ statusCode: 404, message: 'Game not found' })
  }

  return data
})
