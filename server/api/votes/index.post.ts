import { serverSupabaseClient } from '#supabase/server'
import { CastVoteSchema } from '~~/server/schemas/votes'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const body = await validateBody(event, CastVoteSchema)
  const client = await serverSupabaseClient(event)

  const { error } = await client
    .from('mvp_votes')
    .upsert(
      {
        game_id: body.game_id,
        voter_id: user.sub,
        candidate_id: body.candidate_id,
      },
      { onConflict: 'game_id,voter_id' },
    )

  if (error) {
    throw createError({ statusCode: 400, message: error.message })
  }

  // Return updated votes for this game
  const { data: votes } = await client
    .from('mvp_votes')
    .select('*')
    .eq('game_id', body.game_id)

  return votes ?? []
})
