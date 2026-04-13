import { z } from 'zod'

export const CastVoteSchema = z.object({
  game_id: z.string().uuid(),
  candidate_id: z.string().uuid(),
})

export const DeleteVoteSchema = z.object({
  game_id: z.string().uuid(),
})
