<script setup lang="ts">
import type { Alignment } from '~/types'
import type { GamePlayerWithDetails }
  from '~/composables/useGamePlayers'
import GamePlayersTable
  from '~/components/games/GamePlayersTable.vue'
import JoinGameDialog
  from '~/components/games/JoinGameDialog.vue'
import EditEntryDialog
  from '~/components/games/EditEntryDialog.vue'
import AddPlayerDialog
  from '~/components/games/AddPlayerDialog.vue'
import {
  getScriptLabel,
  getWinnerInfo,
} from '~/composables/useGameLabels'

const route = useRoute()
const gameId = route.params.id as string
const toast = useToast()

const { getById } = useGames()
const {
  players,
  status: playersStatus,
  add: addPlayer,
  update: updatePlayer,
  remove: removePlayer,
} = useGamePlayers(gameId)
const { roles } = useRoles()
const {
  players: allPlayers,
  createManual,
} = usePlayers()
const {
  isAuthenticated,
  isAdmin,
  profile,
} = useAuth()

function showSuccess(detail: string) {
  toast.add({
    severity: 'success',
    summary: 'Успішно',
    detail,
    life: 3000,
  })
}

function showError(detail: string) {
  toast.add({
    severity: 'error',
    summary: 'Помилка',
    detail,
    life: 5000,
  })
}

const { data: game, status: gameStatus } = useAsyncData(
  `game-${gameId}`,
  () => getById(gameId),
)

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('uk-UA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const winnerInfo = computed(() =>
  game.value ? getWinnerInfo(game.value.winner) : null,
)

const isPlayerInGame = computed(() => {
  if (!profile.value || !players.value) return true
  return players.value.some(
    p => p.player.id === profile.value!.id,
  )
})

watch(players, (p) => {
  if (game.value && p) {
    game.value.player_count = p.length || null
    clearNuxtData('games')
  }
})

const showJoinDialog = ref(false)

async function handleJoin() {
  if (!profile.value) return
  showJoinDialog.value = false
  try {
    await addPlayer({
      player_id: profile.value.id,
      added_by: profile.value.id,
    })
    showSuccess('Ви приєдналися до гри')
  }
  catch {
    showError('Не вдалося приєднатися до гри')
  }
}

const showEditDialog = ref(false)
const editingEntry = ref<GamePlayerWithDetails | null>(null)

function handleEditEntry(entry: GamePlayerWithDetails) {
  editingEntry.value = entry
  showEditDialog.value = true
}

async function handleUpdated(data: {
  id: string
  starting_role_id: string
  ending_role_id: string | null
  alignment_start: Alignment
  alignment_end: Alignment | null
  is_alive: boolean
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
    showError('Не вдалося оновити запис')
  }
}

// --- Admin: add player ---
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
    showSuccess('Гравця додано')
  }
  catch {
    showError('Не вдалося додати гравця')
  }
}

async function handleCreatePlayer(nickname: string) {
  if (!profile.value) return
  showAddPlayerDialog.value = false
  try {
    const { id } = await createManual(nickname)
    await addPlayer({
      player_id: id,
      added_by: profile.value.id,
    })
    clearNuxtData('players')
    showSuccess(`Гравця "${nickname}" створено та додано`)
  }
  catch {
    showError('Не вдалося створити гравця')
  }
}

// --- Admin: delete player ---
const confirm = useConfirm()

function handleDeleteEntry(entry: GamePlayerWithDetails) {
  confirm.require({
    message: `Видалити ${entry.player.nickname} з гри?`,
    header: 'Підтвердження',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Видалити',
    rejectLabel: 'Скасувати',
    acceptProps: { severity: 'danger' },
    rejectProps: { severity: 'secondary', text: true },
    accept: () => doDelete(entry.id),
  })
}

async function doDelete(entryId: string) {
  try {
    await removePlayer(entryId)
    showSuccess('Гравця видалено')
  }
  catch {
    showError('Не вдалося видалити гравця')
  }
}
</script>

<template>
  <div>
    <!-- Loading -->
    <div
      v-if="gameStatus === 'pending'"
      class="space-y-6"
    >
      <Skeleton
        height="2.5rem"
        width="50%"
        class="!rounded-lg"
      />
      <Skeleton
        height="6rem"
        class="!rounded-xl"
      />
      <Skeleton
        height="20rem"
        class="!rounded-xl"
      />
    </div>

    <!-- Not found -->
    <div
      v-else-if="!game"
      class="flex flex-col items-center py-16
        text-center text-text-muted"
    >
      <i
        class="pi pi-exclamation-circle mb-4
          text-5xl text-text-subtle"
      />
      <p class="font-heading text-xl">
        Гру не знайдено
      </p>
      <NuxtLink
        to="/games"
        class="mt-4 inline-flex items-center gap-1.5
          text-primary transition-colors
          hover:text-primary-hover"
      >
        <i class="pi pi-arrow-left text-sm" />
        Повернутися до списку ігор
      </NuxtLink>
    </div>

    <template v-else>
      <!-- Back link + Edit -->
      <div
        class="mb-6 flex items-center justify-between"
      >
        <NuxtLink
          to="/games"
          class="inline-flex items-center gap-1.5
            text-sm text-text-muted transition-colors
            hover:text-text"
        >
          <i class="pi pi-arrow-left text-xs" />
          Ігри
        </NuxtLink>
        <NuxtLink
          v-if="isAdmin"
          :to="`/games/${game.id}/edit`"
        >
          <Button
            label="Редагувати"
            icon="pi pi-pencil"
            severity="secondary"
            text
            size="small"
          />
        </NuxtLink>
      </div>

      <!-- Winner banner -->
      <div
        class="mb-8 overflow-hidden rounded-xl border
          p-6 sm:p-8"
        :class="[
          game.winner === 'good'
            ? 'border-[color-mix(in_srgb,var(--color-good)_20%,transparent)] bg-[color-mix(in_srgb,var(--color-good)_6%,transparent)]'
            : 'border-[color-mix(in_srgb,var(--color-evil)_20%,transparent)] bg-[color-mix(in_srgb,var(--color-evil)_6%,transparent)]',
        ]"
      >
        <div
          class="flex flex-col gap-4 sm:flex-row
            sm:items-center sm:justify-between"
        >
          <div>
            <h1
              class="font-heading text-2xl font-bold
                tracking-tight sm:text-3xl"
            >
              {{ formatDate(game.date) }}
            </h1>

            <div
              class="mt-3 flex flex-wrap items-center
                gap-2 sm:gap-3"
            >
              <Tag
                :value="getScriptLabel(game.script)"
                severity="secondary"
                rounded
                class="!text-sm"
              />
              <Tag
                v-if="game.script === 'custom'
                  && game.custom_script_name"
                :value="game.custom_script_name"
                severity="secondary"
                rounded
                class="!text-sm"
              />
              <span
                v-if="game.player_count"
                class="flex items-center gap-1.5
                  text-sm text-text-muted"
              >
                <i class="pi pi-users" />
                {{ game.player_count }} гравців
              </span>
              <span
                v-if="game.storyteller"
                class="hidden items-center gap-1.5 lg:flex
                  text-sm text-text-muted"
              >
                <i class="pi pi-book" />
                {{ game.storyteller.nickname }}
              </span>
            </div>
          </div>

          <!-- Winner badge -->
          <div
            class="hidden items-center gap-3 lg:flex
              rounded-xl px-5 py-3"
            :class="[
              game.winner === 'good'
                ? 'bg-[color-mix(in_srgb,var(--color-good)_15%,transparent)]'
                : 'bg-[color-mix(in_srgb,var(--color-evil)_15%,transparent)]',
            ]"
          >
            <div>
              <p class="text-xs uppercase tracking-wider text-text-muted">
                Переможець
              </p>
              <div class="flex items-center gap-2">
                <i
                  class="text-lg sm:text-xl"
                  :class="[
                    winnerInfo?.icon,
                    game.winner === 'good'
                      ? 'text-good'
                      : 'text-evil',
                  ]"
                />
                <p
                  class="font-heading text-lg font-bold
                    sm:text-xl"
                  :class="[
                    game.winner === 'good'
                      ? 'text-good'
                      : 'text-evil',
                  ]"
                >
                  {{ winnerInfo?.labelUa ?? game.winner }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Notes -->
        <p
          v-if="game.notes"
          class="mt-4 rounded-lg border border-white/[0.06]
            bg-white/[0.03] px-4 py-3 text-sm
            leading-relaxed text-text-muted"
        >
          {{ game.notes }}
        </p>
      </div>

      <!-- Players section -->
      <div>
        <div class="mb-4 flex items-center justify-between">
          <h2
            class="font-heading text-xl font-semibold
              tracking-wide sm:text-2xl"
          >
            Гравці
          </h2>
          <div
            v-if="isAuthenticated"
            class="flex gap-2"
          >
            <Button
              v-if="!isPlayerInGame"
              label="Приєднатися"
              icon="pi pi-plus"
              severity="success"
              size="small"
              @click="showJoinDialog = true"
            />
            <Button
              v-if="isAdmin"
              label="Додати гравця"
              icon="pi pi-user-plus"
              severity="secondary"
              outlined
              size="small"
              @click="showAddPlayerDialog = true"
            />
          </div>
        </div>

        <div v-if="playersStatus === 'pending'">
          <Skeleton
            height="20rem"
            class="!rounded-xl"
          />
        </div>
        <GamePlayersTable
          v-else-if="players"
          :players="players"
          :current-user-id="profile?.id ?? null"
          :is-admin="isAdmin"
          @edit-entry="handleEditEntry"
          @delete-entry="handleDeleteEntry"
        />
      </div>
    </template>

    <!-- Dialogs outside v-if/else chain -->
    <JoinGameDialog
      v-model:visible="showJoinDialog"
      @join="handleJoin"
    />

    <EditEntryDialog
      v-model:visible="showEditDialog"
      :entry="editingEntry"
      :roles="roles ?? []"
      @updated="handleUpdated"
    />

    <AddPlayerDialog
      v-model:visible="showAddPlayerDialog"
      :players="allPlayers ?? []"
      :existing-player-ids="existingPlayerIds"
      @add="handleAddPlayer"
      @create="handleCreatePlayer"
    />

    <ConfirmDialog />
  </div>
</template>
