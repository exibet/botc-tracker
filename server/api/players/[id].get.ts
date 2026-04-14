import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const id = requireUuidParam(event, 'id')

  const client = await serverSupabaseClient(event)

  const [profileRes, gamesRes] = await Promise.all([
    client
      .from('profiles')
      .select(PROFILE_SELECT)
      .eq('id', id)
      .single(),
    client
      .from('game_players')
      .select(`
        game_id,
        alignment_start,
        alignment_end,
        is_alive,
        is_mvp,
        starting_role:roles!starting_role_id(
          name_ua, name_en, type, image_url
        ),
        ending_role:roles!ending_role_id(
          name_ua, name_en, type, image_url
        ),
        game:games!game_id(
          id, date, script, status, winner, created_at
        )
      `)
      .eq('player_id', id),
  ])

  if (profileRes.error) {
    throw createError({ statusCode: 404, message: 'Player not found' })
  }
  if (gamesRes.error) {
    throw createError({ statusCode: 500, message: 'Не вдалося завантажити ігри гравця' })
  }

  return {
    profile: profileRes.data,
    games: gamesRes.data,
  }
})
