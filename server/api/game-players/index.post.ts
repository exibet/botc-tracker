import { serverSupabaseClient } from '#supabase/server'
import { AddGamePlayerSchema } from '~~/server/schemas/game-players'

export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const body = await validateBody(event, AddGamePlayerSchema)
  const client = await serverSupabaseClient(event)

  const { data, error } = await client
    .from('game_players')
    .insert(body)
    .select(GAME_PLAYER_WITH_ROLES_SELECT)
    .single()

  if (error) {
    throw createError({ statusCode: 400, message: 'Не вдалося додати гравця' })
  }

  return data
})
