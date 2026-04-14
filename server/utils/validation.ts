import type { ZodSchema } from 'zod'
import type { H3Event } from 'h3'

export function parseLimit(value: unknown, defaultVal = 10, max = 100): number {
  const n = Number(value)
  if (!Number.isFinite(n) || n < 1) return defaultVal
  return Math.min(Math.floor(n), max)
}

export async function validateBody<T>(
  event: H3Event,
  schema: ZodSchema<T>,
): Promise<T> {
  const raw = await readBody(event)
  const result = schema.safeParse(raw)

  if (!result.success) {
    const fields = result.error.issues
      .map(i => `${i.path.join('.')}: ${i.message}`)
      .join('; ')

    throw createError({
      statusCode: 400,
      message: `Невалідні дані: ${fields}`,
    })
  }

  return result.data
}
