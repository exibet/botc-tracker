import type { MvpVote } from '~/types'
import type { GamePlayerWithDetails }
  from '~/composables/useGamePlayers'

export interface VoteTallyEntry {
  candidateId: string
  nickname: string
  avatarUrl: string | null
  voteCount: number
  voters: string[]
}

export function useMvpVoting(
  gameId: Ref<string> | string,
  initialVotes?: MvpVote[] | null,
) {
  const client = useSupabaseClient()
  const id = toRef(gameId)

  const votes = ref<MvpVote[] | null>(initialVotes ?? null)
  const loaded = ref(!!initialVotes)

  async function fetchVotes() {
    if (!id.value) {
      votes.value = []
      return
    }
    const { data, error } = await client
      .from('mvp_votes')
      .select('*')
      .eq('game_id', id.value)

    if (error) throw error
    votes.value = data as MvpVote[]
    loaded.value = true
  }

  if (!initialVotes) {
    fetchVotes()
  }

  async function refresh() {
    await fetchVotes()
  }

  function setVotes(data: MvpVote[]) {
    votes.value = data
  }

  function myVote(
    userId: string | null,
  ): MvpVote | null {
    if (!userId || !votes.value) return null
    return votes.value.find(
      v => v.voter_id === userId,
    ) ?? null
  }

  async function deleteVote(voterId: string) {
    const { error } = await client
      .from('mvp_votes')
      .delete()
      .eq('game_id', id.value)
      .eq('voter_id', voterId)
    if (error) throw error
  }

  async function castVote(
    voterId: string,
    candidateId: string,
  ) {
    const { error } = await client
      .from('mvp_votes')
      .upsert(
        {
          game_id: id.value,
          voter_id: voterId,
          candidate_id: candidateId,
        },
        { onConflict: 'game_id,voter_id' },
      )
    if (error) throw error
  }

  async function removeVote(voterId: string) {
    await deleteVote(voterId)
  }

  function voteTally(
    players: GamePlayerWithDetails[],
  ): VoteTallyEntry[] {
    if (!votes.value?.length) return []

    const countMap = new Map<string, string[]>()
    for (const v of votes.value) {
      const list = countMap.get(v.candidate_id) ?? []
      list.push(v.voter_id)
      countMap.set(v.candidate_id, list)
    }

    return players
      .filter(p => countMap.has(p.player.id))
      .map(p => ({
        candidateId: p.player.id,
        nickname: p.player.nickname,
        avatarUrl: p.player.avatar_url,
        voteCount: countMap.get(p.player.id)!.length,
        voters: countMap.get(p.player.id)!,
      }))
      .sort((a, b) => b.voteCount - a.voteCount)
  }

  return {
    votes,
    refresh,
    setVotes,
    myVote,
    castVote,
    removeVote,
    voteTally,
  }
}
