import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const id = requireUuidParam(event, 'id')

  const client = await serverSupabaseClient(event)

  const { error } = await client
    .from('games')
    .delete()
    .eq('id', id)

  if (error) {
    throw createError({ statusCode: 400, message: 'Не вдалося видалити гру' })
  }

  return { success: true }
})
