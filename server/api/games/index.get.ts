import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const query = getQuery(event)

  const limit = parseLimit(query.limit, 50, 100)
  const page = Math.max(1, Math.floor(Number(query.page) || 1))
  const offset = (page - 1) * limit

  const { data, error, count } = await client
    .from('games')
    .select(GAME_WITH_DETAILS_SELECT, { count: 'exact' })
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    throw createError({ statusCode: 500, message: 'Не вдалося завантажити ігри' })
  }

  return { data: data ?? [], total: count ?? 0 }
})
