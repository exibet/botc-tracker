import type { H3Event } from 'h3'

export async function getEventProfile(event: H3Event) {
  const getProfile = event.context.getProfile as (() => ReturnType<typeof import('./profile').getProfile>) | undefined
  if (!getProfile) return null
  return getProfile()
}

export async function requireAuth(event: H3Event) {
  const profile = await getEventProfile(event)
  if (!profile) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }
  return profile
}

export async function requireAdmin(event: H3Event) {
  const profile = await requireAuth(event)
  if (profile.role !== 'admin') {
    throw createError({ statusCode: 403, message: 'Forbidden' })
  }
  return profile
}
