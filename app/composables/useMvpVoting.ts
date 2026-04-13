import type { MvpVote } from '~/types'
import type { GamePlayerWithDetails }
  from '~/composables/useGamePlayers'
import { API } from '#shared/api'

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
  const id = toRef(gameId)

  const votes = ref<MvpVote[] | null>(initialVotes ?? null)
  const loaded = ref(!!initialVotes)

  async function fetchVotes() {
    if (!id.value) {
      votes.value = []
      return
    }
    // Votes come from the game detail endpoint
    const game = await $fetch(API.GAME(id.value))
    votes.value = (game as { mvp_votes?: MvpVote[] })
      .mvp_votes ?? []
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

  async function castVote(
    _voterId: string,
    candidateId: string,
  ) {
    const updatedVotes = await $api<MvpVote[]>(API.VOTES, {
      method: 'POST',
      body: { game_id: id.value, candidate_id: candidateId },
    })
    votes.value = updatedVotes
  }

  async function removeVote(_voterId: string) {
    await $api(API.VOTES, {
      method: 'DELETE',
      body: { game_id: id.value },
    })
    // Remove the voter's vote from local state
    if (votes.value) {
      const user = useSupabaseUser()
      votes.value = votes.value.filter(
        v => v.voter_id !== user.value?.sub,
      )
    }
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
