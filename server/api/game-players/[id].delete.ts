import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'Entry ID required' })
  }

  const client = await serverSupabaseClient(event)

  const profile = event.context.profile
  if (profile?.role !== 'admin') {
    const { data: entry } = await client
      .from('game_players')
      .select('player_id')
      .eq('id', id)
      .single()

    if (!entry || entry.player_id !== profile?.id) {
      throw createError({ statusCode: 403, message: 'Forbidden' })
    }
  }

  const { error } = await client
    .from('game_players')
    .delete()
    .eq('id', id)

  if (error) {
    throw createError({ statusCode: 400, message: error.message })
  }

  return { success: true }
})
