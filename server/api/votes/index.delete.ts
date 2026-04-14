import { serverSupabaseClient } from '#supabase/server'
import { DeleteVoteSchema } from '~~/server/schemas/votes'

export default defineEventHandler(async (event) => {
  const profile = await requireAuth(event)
  const body = await validateBody(event, DeleteVoteSchema)
  const client = await serverSupabaseClient(event)

  const { error } = await client
    .from('mvp_votes')
    .delete()
    .eq('game_id', body.game_id)
    .eq('voter_id', profile.id)

  if (error) {
    throw createError({ statusCode: 400, message: 'Не вдалося видалити голос' })
  }

  return { success: true }
})
