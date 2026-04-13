import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'Game ID required' })
  }

  const client = await serverSupabaseClient(event)

  const { error } = await client
    .from('games')
    .delete()
    .eq('id', id)

  if (error) {
    throw createError({ statusCode: 400, message: error.message })
  }

  return { success: true }
})
