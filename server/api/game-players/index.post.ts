import { serverSupabaseClient } from '#supabase/server'
import { AddGamePlayerSchema } from '~~/server/schemas/game-players'

const SELECT_WITH_DETAILS = `
  *,
  player:profiles!player_id(id, nickname, avatar_url),
  starting_role:roles!starting_role_id(id, name_ua, name_en, image_url, type),
  ending_role:roles!ending_role_id(id, name_ua, name_en, image_url, type)
`

export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const body = await validateBody(event, AddGamePlayerSchema)
  const client = await serverSupabaseClient(event)

  const { data, error } = await client
    .from('game_players')
    .insert(body)
    .select(SELECT_WITH_DETAILS)
    .single()

  if (error) {
    throw createError({ statusCode: 400, message: 'Не вдалося додати гравця' })
  }

  return data
})
