<script setup lang="ts">
import type { MvpVote } from '~/types'
import type { GamePlayerWithDetails }
  from '~/composables/useGamePlayers'
import PlayerAvatar
  from '~/components/players/PlayerAvatar.vue'
import { pluralizeUa } from '~/utils/display'

const props = withDefaults(defineProps<{
  gameId: string
  players: GamePlayerWithDetails[]
  currentUserId: string | null
  isParticipant: boolean
  votingOpen?: boolean
  initialVotes?: MvpVote[] | null
}>(), {
  initialVotes: null,
})

const emit = defineEmits<{
  'vote-changed': []
}>()

const {
  votes,
  myVote,
  setVotes,
  castVote,
  removeVote,
  voteTally,
} = useMvpVoting(props.gameId, props.initialVotes)

defineExpose({ setVotes })

const totalVoters = computed(() => {
  if (!votes.value) return 0
  return new Set(votes.value.map(v => v.voter_id)).size
})

const tally = computed(
  () => voteTally(props.players),
)

const quorumReached = computed(
  () => totalVoters.value * 2 >= props.players.length,
)

const hasClearWinner = computed(() => {
  if (tally.value.length === 0) return false
  if (tally.value.length === 1) return true
  return tally.value[0].voteCount
    !== tally.value[1].voteCount
})

const mvpElected = computed(
  () => quorumReached.value && hasClearWinner.value,
)

const votesNeeded = computed(
  () => Math.ceil(props.players.length / 2)
    - totalVoters.value,
)

const currentVote = computed(
  () => props.currentUserId
    ? myVote(props.currentUserId)
    : null,
)

const maxVotes = computed(
  () => tally.value[0]?.voteCount ?? 0,
)

const candidates = computed(() =>
  props.players
    .filter(p => p.player.id !== props.currentUserId)
    .map(p => ({
      label: p.player.nickname,
      value: p.player.id,
      avatarUrl: p.player.avatar_url,
    })),
)

const popoverRef = ref()
const isSubmitting = ref(false)

const { success: showSuccess } = useAppToast()

async function handleVote(candidateId: string) {
  if (!props.currentUserId) return
  popoverRef.value?.hide()
  isSubmitting.value = true
  try {
    await castVote(
      props.currentUserId,
      candidateId,
    )
    emit('vote-changed')
    showSuccess('Голос враховано')
  }
  catch {
    // Error toast shown by $api
  }
  finally {
    isSubmitting.value = false
  }
}

async function handleRemoveVote() {
  if (!props.currentUserId) return
  isSubmitting.value = true
  try {
    await removeVote(props.currentUserId)
    emit('vote-changed')
    showSuccess('Голос скасовано')
  }
  catch {
    // Error toast shown by $api
  }
  finally {
    isSubmitting.value = false
  }
}

const hasVoted = computed(
  () => !!currentVote.value,
)

const canVote = computed(
  () => props.votingOpen !== false
    && props.currentUserId
    && props.isParticipant,
)

const votedCandidate = computed(() => {
  if (!currentVote.value) return null
  return candidates.value.find(
    c => c.value === currentVote.value!.candidate_id,
  ) ?? null
})

function barWidth(voteCount: number): string {
  if (!maxVotes.value) return '0%'
  return `${(voteCount / maxVotes.value) * 100}%`
}
</script>

<template>
  <div class="mt-8">
    <!-- Section header -->
    <div class="mb-4 flex items-center gap-2 px-4 sm:px-6">
      <i
        class="pi pi-trophy text-accent"
      />
      <h2
        class="font-heading text-xl font-semibold
          tracking-wide sm:text-2xl"
      >
        Голосування за MVP
      </h2>
    </div>

    <div
      class="overflow-hidden rounded-xl border
        border-white/[0.06] bg-white/[0.02]"
    >
      <!-- Vote controls (participant only) -->
      <div
        v-if="canVote"
        class="border-b border-white/[0.06] px-4
          py-4 sm:px-6"
      >
        <!-- Already voted state -->
        <div
          v-if="hasVoted && votedCandidate"
          class="flex items-center gap-2 text-sm"
        >
          <span class="text-text-muted">
            Ваш голос:
          </span>
          <PlayerAvatar
            :avatar-url="votedCandidate.avatarUrl"
            :nickname="votedCandidate.label"
            size="xs"
          />
          <span class="font-semibold">
            {{ votedCandidate.label }}
          </span>
          <button
            class="ml-auto text-sm text-text-muted
              transition-colors hover:text-red-400
              disabled:opacity-50"
            :disabled="isSubmitting"
            @click="handleRemoveVote"
          >
            Скасувати
          </button>
        </div>

        <!-- Not voted yet state -->
        <div
          v-else
          class="flex items-center justify-between gap-3"
        >
          <p class="text-sm text-text-muted">
            Хто був найкращим у цій грі?
          </p>
          <Button
            label="Голосувати"
            icon="pi pi-star"
            size="small"
            severity="success"
            variant="outlined"
            :disabled="isSubmitting"
            :loading="isSubmitting"
            @click="popoverRef.toggle($event)"
          />

          <Popover ref="popoverRef">
            <div
              class="flex max-h-64 w-56 flex-col
                gap-0.5 overflow-y-auto py-1"
            >
              <button
                v-for="candidate in candidates"
                :key="candidate.value"
                class="flex items-center gap-2.5
                  rounded-lg px-3 py-2 text-left
                  transition-colors
                  hover:bg-white/[0.08]
                  active:bg-white/[0.12]"
                @click="handleVote(candidate.value)"
              >
                <PlayerAvatar
                  :avatar-url="candidate.avatarUrl"
                  :nickname="candidate.label"
                  size="sm"
                />
                <span class="text-sm font-medium">
                  {{ candidate.label }}
                </span>
              </button>
            </div>
          </Popover>
        </div>
      </div>

      <!-- Results -->
      <div class="px-4 py-4 sm:px-6">
        <!-- Empty state -->
        <div
          v-if="!tally.length"
          class="flex flex-col items-center py-8
            text-center"
        >
          <i
            class="pi pi-star mb-3
              text-text-subtle"
          />
          <p class="text-sm text-text-muted">
            Ще ніхто не проголосував
          </p>
        </div>

        <!-- Bar chart -->
        <div
          v-else
          class="space-y-3"
        >
          <div
            class="mb-4 flex items-center
              justify-between"
          >
            <p
              class="text-xs font-semibold
                uppercase tracking-wider text-text-muted"
            >
              Результати
            </p>
            <Tag
              v-if="mvpElected"
              value="MVP обрано"
              severity="success"
              rounded
              class="!px-2 !py-0.5 !text-xs"
            />
            <Tag
              v-else-if="quorumReached && !hasClearWinner"
              value="Нічия"
              severity="warn"
              rounded
              class="!px-2 !py-0.5 !text-xs"
            />
            <p
              v-else
              class="text-xs text-text-muted"
            >
              Потрібно ще {{ votesNeeded }}
              {{ pluralizeUa(
                votesNeeded,
                'голос', 'голоси', 'голосів',
              ) }}
            </p>
          </div>

          <div
            v-for="entry in tally"
            :key="entry.candidateId"
            class="group"
          >
            <div class="flex items-center gap-3">
              <!-- Avatar -->
              <PlayerAvatar
                :avatar-url="entry.avatarUrl"
                :nickname="entry.nickname"
                size="sm"
              />

              <!-- Bar + info -->
              <div class="min-w-0 flex-1">
                <div
                  class="mb-1 flex items-center
                    justify-between"
                >
                  <span class="text-sm font-semibold">
                    {{ entry.nickname }}
                  </span>
                  <span
                    class="text-xs tabular-nums
                      text-text-muted"
                  >
                    {{ entry.voteCount }}
                    {{ pluralizeUa(
                      entry.voteCount,
                      'голос', 'голоси', 'голосів',
                    ) }}
                  </span>
                </div>

                <!-- Bar -->
                <div
                  class="h-1 overflow-hidden rounded-full
                    bg-white/[0.06]"
                >
                  <div
                    class="h-full rounded-full
                      bg-accent transition-all
                      duration-500 ease-out"
                    :style="{
                      width: barWidth(entry.voteCount),
                    }"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
