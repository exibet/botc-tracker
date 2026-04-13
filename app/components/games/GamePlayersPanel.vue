<script setup lang="ts">
import type {
  Alignment,
  GamePlayerInline,
  GamePlayerLight,
  MvpVote,
} from '#shared/types'
import type { GamePlayerWithDetails }
  from '~/composables/useGamePlayers'
import GamePlayersTable
  from '~/components/games/GamePlayersTable.vue'
import EditEntryDialog
  from '~/components/games/EditEntryDialog.vue'
import JoinGameDialog
  from '~/components/games/JoinGameDialog.vue'
import AddPlayerDialog
  from '~/components/games/AddPlayerDialog.vue'
import MvpVotingSection
  from '~/components/games/MvpVotingSection.vue'

const props = withDefaults(defineProps<{
  gameId: string
  winner?: 'good' | 'evil' | null
  showHeader?: boolean
  gameStatus?: string
  initialPlayers?: (GamePlayerLight | GamePlayerInline)[] | null
  initialVotes?: MvpVote[] | null
}>(), {
  winner: null,
  showHeader: true,
  gameStatus: 'upcoming',
  initialPlayers: null,
  initialVotes: null,
})

const {
  isAuthenticated,
  isAdmin,
  profile,
} = useAuth()
const { roles } = useRoles()
const { createManual, refreshPlayers } = usePlayers()
const { success: showSuccess } = useAppToast()
const confirm = useConfirm()

function isInline(
  p: GamePlayerLight | GamePlayerInline,
): p is GamePlayerInline {
  return 'id' in p
}

const inlinePlayers = props.initialPlayers
  ?.filter(isInline) ?? null

const {
  players,
  status,
  refreshFromGame,
  add: addPlayer,
  update: updatePlayer,
  remove: removePlayer,
} = useGamePlayers(
  computed(() => props.gameId),
  inlinePlayers,
)

const mvpSectionRef = ref<InstanceType<typeof MvpVotingSection> | null>(null)

const emit = defineEmits<{
  'game-updated': [game: import('#shared/types').GameWithDetails]
  'player-count-changed': [count: number]
}>()

async function refreshGameData() {
  const result = await refreshFromGame()
  if (!result) return
  mvpSectionRef.value?.setVotes(result.votes)
  emit('game-updated', result.game)
}

const playerCount = computed(
  () => players.value?.length ?? 0,
)

defineExpose({ players, status, playerCount })

const isPlayerInGame = computed(() => {
  if (!profile.value || !players.value) return true
  return players.value.some(
    p => p.player.id === profile.value!.id,
  )
})

const canJoinOrLeave = computed(() =>
  props.gameStatus === 'upcoming'
  || props.gameStatus === 'in_progress',
)

// --- Join ---
const showJoinDialog = ref(false)

async function handleJoin() {
  if (!profile.value) return
  showJoinDialog.value = false
  try {
    await addPlayer({
      player_id: profile.value.id,
      added_by: profile.value.id,
    })
    emit('player-count-changed', players.value?.length ?? 0)
    showSuccess('Ви приєдналися до гри')
  }
  catch {
    // Error toast shown by $api
  }
}

// --- Add player (admin) ---
const showAddPlayerDialog = ref(false)

const existingPlayerIds = computed(() =>
  players.value?.map(p => p.player.id) ?? [],
)

async function handleAddPlayer(playerId: string) {
  if (!profile.value) return
  showAddPlayerDialog.value = false
  try {
    await addPlayer({
      player_id: playerId,
      added_by: profile.value.id,
    })
    emit('player-count-changed', players.value?.length ?? 0)
    showSuccess('Гравця додано')
  }
  catch {
    // Error toast shown by $api
  }
}

async function handleCreatePlayer(
  nickname: string,
) {
  if (!profile.value) return
  showAddPlayerDialog.value = false
  try {
    const { id } = await createManual(nickname)
    await refreshPlayers()
    await addPlayer({
      player_id: id,
      added_by: profile.value.id,
    })
    emit('player-count-changed', players.value?.length ?? 0)
    showSuccess(
      `Гравця "${nickname}" створено та додано`,
    )
  }
  catch {
    // Error toast shown by $api
  }
}

// --- Edit ---
const showEditDialog = ref(false)
const editingEntry
  = ref<GamePlayerWithDetails | null>(null)

function handleEditEntry(
  entry: GamePlayerWithDetails,
) {
  if (!isAdmin.value && props.gameStatus !== 'in_progress') return
  editingEntry.value = { ...entry }
  showEditDialog.value = true
}

async function handleUpdated(data: {
  id: string
  starting_role_id: string
  ending_role_id: string | null
  alignment_start: Alignment
  alignment_end: Alignment | null
  is_alive: boolean | null
}) {
  showEditDialog.value = false
  try {
    await updatePlayer(data.id, {
      starting_role_id: data.starting_role_id,
      ending_role_id: data.ending_role_id,
      alignment_start: data.alignment_start,
      alignment_end: data.alignment_end,
      is_alive: data.is_alive,
    })
    showSuccess('Запис оновлено')
  }
  catch {
    // Error toast shown by $api
  }
}

// --- Delete ---
function handleDeleteEntry(
  entry: GamePlayerWithDetails,
) {
  confirm.require({
    message:
      `Видалити ${entry.player.nickname} з гри?`,
    header: 'Підтвердження',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Видалити',
    rejectLabel: 'Скасувати',
    acceptProps: { severity: 'danger' },
    rejectProps: {
      severity: 'secondary', text: true,
    },
    accept: () => doDelete(entry.id),
  })
}

async function doDelete(entryId: string) {
  try {
    await removePlayer(entryId)
    emit('player-count-changed', players.value?.length ?? 0)
    // Refresh votes — trigger deletes votes for removed player
    await refreshGameData()
    showSuccess('Гравця видалено')
  }
  catch {
    // Error toast shown by $api
  }
}
</script>

<template>
  <div>
    <!-- Header with actions -->
    <div
      v-if="showHeader"
      class="my-4 flex items-center justify-between
        px-4 sm:px-6"
    >
      <h2
        class="font-heading text-xl font-semibold
          tracking-wide sm:text-2xl"
      >
        Гравці
      </h2>
      <div
        v-if="isAuthenticated"
        class="flex gap-4"
      >
        <Button
          v-if="!isPlayerInGame && canJoinOrLeave"
          icon="pi pi-plus"
          severity="success"
          size="small"
          class="min-w-[50px] sm:!hidden"
          @click="showJoinDialog = true"
        />
        <Button
          v-if="!isPlayerInGame && canJoinOrLeave"
          label="Приєднатися"
          icon="pi pi-plus"
          severity="success"
          variant="outlined"
          size="small"
          class="!hidden sm:!inline-flex"
          @click="showJoinDialog = true"
        />
        <Button
          v-if="isAdmin && canJoinOrLeave"
          icon="pi pi-user-plus"
          severity="secondary"
          outlined
          size="small"
          class="min-w-[50px] sm:!hidden"
          @click="showAddPlayerDialog = true"
        />
        <Button
          v-if="isAdmin && canJoinOrLeave"
          label="Додати гравця"
          icon="pi pi-user-plus"
          severity="secondary"
          outlined
          size="small"
          class="!hidden sm:!inline-flex"
          @click="showAddPlayerDialog = true"
        />
      </div>
    </div>

    <!-- Loading (initial only) -->
    <div
      v-if="status === 'pending' && !players"
      class="p-4"
    >
      <Skeleton
        height="10rem"
        class="!rounded-xl"
      />
    </div>

    <!-- Table -->
    <GamePlayersTable
      v-else-if="players"
      :players="players"
      :current-user-id="profile?.id ?? null"
      :is-admin="isAdmin"
      :winner="winner ?? null"
      :game-status="gameStatus"
      @edit-entry="handleEditEntry"
      @delete-entry="handleDeleteEntry"
    />

    <!-- MVP Voting -->
    <MvpVotingSection
      v-if="players && players.length > 1 && gameStatus !== 'upcoming'"
      ref="mvpSectionRef"
      :game-id="gameId"
      :players="players"
      :current-user-id="profile?.id ?? null"
      :is-participant="isPlayerInGame"
      :voting-open="gameStatus === 'in_progress'"
      :initial-votes="initialVotes"
      @vote-changed="refreshGameData"
    />

    <!-- Dialogs -->
    <JoinGameDialog
      v-model:visible="showJoinDialog"
      @join="handleJoin"
    />

    <AddPlayerDialog
      v-model:visible="showAddPlayerDialog"
      :existing-player-ids="existingPlayerIds"
      @add="handleAddPlayer"
      @create="handleCreatePlayer"
    />

    <EditEntryDialog
      v-model:visible="showEditDialog"
      :entry="editingEntry"
      :roles="roles ?? []"
      @updated="handleUpdated"
    />

    <ConfirmDialog />
  </div>
</template>
