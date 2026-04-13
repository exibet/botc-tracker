import { z } from 'zod'
import { SCRIPTS, GAME_STATUSES, WINNERS } from '#shared/constants'

export const CreateGameSchema = z.object({
  date: z.string().date(),
  script: z.enum(SCRIPTS),
  custom_script_name: z.string().max(100).nullable().optional(),
  storyteller_id: z.string().uuid().nullable().optional(),
  notes: z.string().max(1000).nullable().optional(),
  player_count: z.number().int().nullable().optional(),
})

export const UpdateGameSchema = CreateGameSchema.partial().extend({
  status: z.enum(GAME_STATUSES).optional(),
  winner: z.enum(WINNERS).nullable().optional(),
})
