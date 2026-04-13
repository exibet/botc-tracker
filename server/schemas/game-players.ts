import { z } from 'zod'
import { ALIGNMENTS } from '#shared/constants'

export const AddGamePlayerSchema = z.object({
  game_id: z.string().uuid(),
  player_id: z.string().uuid(),
  starting_role_id: z.string().nullable().optional(),
  ending_role_id: z.string().nullable().optional(),
  alignment_start: z.enum(ALIGNMENTS).nullable().optional(),
  alignment_end: z.enum(ALIGNMENTS).nullable().optional(),
  is_alive: z.boolean().nullable().optional(),
  is_mvp: z.boolean().optional(),
  added_by: z.string().uuid(),
})

export const UpdateGamePlayerSchema = AddGamePlayerSchema
  .omit({ game_id: true, player_id: true, added_by: true })
  .partial()
