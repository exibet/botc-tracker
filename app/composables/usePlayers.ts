import type { Profile } from '~/types'

export function usePlayers() {
  const client = useSupabaseClient()

  const { data: players, status } = useAsyncData('players', async () => {
    const { data, error } = await client
      .from('profiles')
      .select('*')
      .order('nickname')

    if (error) throw error
    return data as Profile[]
  })

  return { players, status }
}
