import type { ZodSchema } from 'zod'
import type { H3Event } from 'h3'

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
