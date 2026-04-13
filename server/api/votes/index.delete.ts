import { serverSupabaseClient } from '#supabase/server'
import { DeleteVoteSchema } from '~~/server/schemas/votes'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const body = await validateBody(event, DeleteVoteSchema)
  const client = await serverSupabaseClient(event)

  const { error } = await client
    .from('mvp_votes')
    .delete()
    .eq('game_id', body.game_id)
    .eq('voter_id', user.sub)

  if (error) {
    throw createError({ statusCode: 400, message: error.message })
  }

  return { success: true }
})
