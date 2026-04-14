import { serverSupabaseClient } from '#supabase/server'

export default defineCachedEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)

  const { data, error } = await client
    .from('roles')
    .select('id, name_en, name_ua, description_en, description_ua, type, edition, image_url')
    .order('type')
    .order('name_en')

  if (error) {
    throw createError({ statusCode: 500, message: 'Не вдалося завантажити ролі' })
  }

  return data
}, {
  maxAge: 3600,
  name: 'roles',
})
