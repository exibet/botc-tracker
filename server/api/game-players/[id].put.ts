import { serverSupabaseClient } from '#supabase/server'
import { UpdateGamePlayerSchema } from '~~/server/schemas/game-players'

export default defineEventHandler(async (event) => {
  const profile = await requireAuth(event)

  const id = requireUuidParam(event, 'id')

  const body = await validateBody(event, UpdateGamePlayerSchema)
  const client = await serverSupabaseClient(event)
  if (profile.role !== 'admin') {
    const { data: entry } = await client
      .from('game_players')
      .select('player_id')
      .eq('id', id)
      .single()

    if (!entry || entry.player_id !== profile.id) {
      throw createError({ statusCode: 403, message: 'Forbidden' })
    }
  }

  const { data, error } = await client
    .from('game_players')
    .update(body)
    .eq('id', id)
    .select(GAME_PLAYER_WITH_ROLES_SELECT)
    .single()

  if (error) {
    throw createError({ statusCode: 400, message: 'Не вдалося оновити запис гравця' })
  }

  return data
})
