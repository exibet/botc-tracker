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

  async function createManual(nickname: string) {
    const { data, error } = await client
      .from('profiles')
      .insert({
        id: crypto.randomUUID(),
        nickname,
        is_manual: true,
      })
      .select('id')
      .single()

    if (error) throw error
    return data
  }

  return { players, status, createManual }
}
