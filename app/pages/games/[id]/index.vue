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
} = useGamePlayers(gameId)
const { roles } = useRoles()
const {
  isAuthenticated,
  isAdmin,
  profile,
} = useAuth()

const { data: game, status: gameStatus } = useAsyncData(
  `game-${gameId}`,
  () => getById(gameId),
)

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('uk-UA', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
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

const showJoinDialog = ref(false)

async function handleJoin(data: {
  starting_role_id: string
  alignment_start: Alignment
}) {
  if (!profile.value) return
  showJoinDialog.value = false
  try {
    await addPlayer({
      player_id: profile.value.id,
      starting_role_id: data.starting_role_id,
      alignment_start: data.alignment_start,
      added_by: profile.value.id,
    })
    toast.add({
      severity: 'success',
      summary: 'Успішно',
      detail: 'Ви приєдналися до гри',
      life: 3000,
    })
  }
  catch {
    toast.add({
      severity: 'error',
      summary: 'Помилка',
      detail: 'Не вдалося приєднатися до гри',
      life: 5000,
    })
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
    toast.add({
      severity: 'success',
      summary: 'Успішно',
      detail: 'Запис оновлено',
      life: 3000,
    })
  }
  catch {
    toast.add({
      severity: 'error',
      summary: 'Помилка',
      detail: 'Не вдалося оновити запис',
      life: 5000,
    })
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
                class="flex items-center gap-1.5
                  text-sm text-text-muted"
              >
                <i class="pi pi-book" />
                {{ game.storyteller.nickname }}
              </span>
            </div>
          </div>

          <!-- Winner badge -->
          <div
            class="flex items-center gap-3
              rounded-xl px-5 py-3"
            :class="[
              game.winner === 'good'
                ? 'bg-[color-mix(in_srgb,var(--color-good)_15%,transparent)]'
                : 'bg-[color-mix(in_srgb,var(--color-evil)_15%,transparent)]',
            ]"
          >
            <i
              class="text-2xl sm:text-3xl"
              :class="[
                winnerInfo?.icon,
                game.winner === 'good'
                  ? 'text-good'
                  : 'text-evil',
              ]"
            />
            <div>
              <p class="text-xs uppercase tracking-wider text-text-muted">
                Переможець
              </p>
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
        <h2
          class="mb-4 font-heading text-xl font-semibold
            tracking-wide sm:text-2xl"
        >
          Гравці
        </h2>

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
          @edit-entry="handleEditEntry"
        />

        <!-- Join game button -->
        <div
          v-if="isAuthenticated && !isPlayerInGame"
          class="mt-4"
        >
          <Button
            label="Приєднатися до гри"
            icon="pi pi-plus"
            @click="showJoinDialog = true"
          />
        </div>
      </div>
    </template>

    <!-- Dialogs outside v-if/else chain -->
    <JoinGameDialog
      v-model:visible="showJoinDialog"
      :roles="roles ?? []"
      @join="handleJoin"
    />

    <EditEntryDialog
      v-model:visible="showEditDialog"
      :entry="editingEntry"
      :roles="roles ?? []"
      @updated="handleUpdated"
    />
  </div>
</template>
