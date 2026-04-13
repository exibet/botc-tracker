import { z } from 'zod'

export const CreateManualSchema = z.object({
  nickname: z.string().min(1).max(50).trim(),
})

export const LinkProfileSchema = z.object({
  manual_id: z.string().uuid(),
  auth_id: z.string().uuid(),
})

export const UnlinkProfileSchema = z.object({
  auth_id: z.string().uuid(),
  nickname: z.string().min(1).max(50),
})
