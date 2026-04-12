<script setup lang="ts">
import GamePlayersPanel
  from '~/components/games/GamePlayersPanel.vue'
import PlayerAvatar
  from '~/components/players/PlayerAvatar.vue'
import WinnerSelector
  from '~/components/games/WinnerSelector.vue'
import type { Winner } from '~/types'
import {
  getGameStatusInfo,
  getScriptLabel,
  getWinnerInfo,
} from '~/composables/useGameLabels'
import { formatDateLong } from '~/utils/date'

const route = useRoute()
const gameId = route.params.id as string

const { getById, update, remove } = useGames()
const { isAdmin } = useAuth()
const confirm = useConfirm()
const { success: toastSuccess, error: toastError } = useAppToast()
const router = useRouter()

const { data: game, status: gameStatus, refresh: refreshGame } = useAsyncData(
  `game-${gameId}`,
  () => getById(gameId),
)

const winnerInfo = computed(() =>
  game.value ? getWinnerInfo(game.value.winner) : null,
)

const mvpPlayer = computed(
  () => game.value?.mvp_player ?? null,
)

const statusInfo = computed(() =>
  game.value ? getGameStatusInfo(game.value.status) : null,
)

const transitioning = ref(false)
const showFinishDialog = ref(false)
const selectedWinner = ref<Winner | null>(null)

async function finishGame() {
  if (!selectedWinner.value) return
  showFinishDialog.value = false
  await transitionStatus('finished', { winner: selectedWinner.value })
  selectedWinner.value = null
}

const panelRef = ref<InstanceType<
  typeof GamePlayersPanel
> | null>(null)

function onPlayerCountChanged(count: number) {
  if (game.value) {
    game.value = { ...game.value, player_count: count || null }
  }
}

async function transitionStatus(
  newStatus: 'upcoming' | 'in_progress' | 'finished',
  updates: Record<string, unknown> = {},
) {
  transitioning.value = true
  try {
    await update(gameId, { status: newStatus, ...updates })
    await refreshGame()
    toastSuccess(`Статус змінено: ${getGameStatusInfo(newStatus)?.labelUa}`)
  }
  catch {
    toastError('Не вдалося змінити статус гри')
  }
  finally {
    transitioning.value = false
  }
}

function confirmDelete() {
  confirm.require({
    group: 'delete-game',
    message: 'Ви впевнені, що хочете видалити цю гру?',
    header: 'Видалення гри',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Видалити',
    rejectLabel: 'Скасувати',
    acceptProps: { severity: 'danger' },
    rejectProps: { severity: 'secondary', text: true },
    accept: async () => {
      try {
        await remove(gameId)
        toastSuccess('Гру видалено')
        router.push('/games')
      }
      catch {
        toastError('Не вдалося видалити гру')
      }
    },
  })
}
</script>

<template>
  <div>
    <!-- Loading -->
    <div
      v-if="gameStatus === 'pending' && !game"
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
      v-else-if="gameStatus !== 'pending' && !game"
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
        <i class="pi pi-arrow-left" />
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
          <i class="pi pi-arrow-left" />
          Ігри
        </NuxtLink>
        <ClientOnly>
          <div
            v-if="isAdmin"
            class="flex gap-1"
          >
            <NuxtLink :to="`/games/${game.id}/edit`">
              <Button
                label="Редагувати"
                icon="pi pi-pencil"
                severity="secondary"
                text
                size="small"
              />
            </NuxtLink>
            <Button
              icon="pi pi-trash"
              severity="danger"
              text
              size="small"
              @click="confirmDelete"
            />
          </div>
        </ClientOnly>
      </div>

      <!-- Status banner -->
      <div
        class="mb-8 overflow-hidden rounded-xl border p-6"
        :class="[
          game.status === 'finished' && game.winner === 'good'
            ? 'border-[color-mix(in_srgb,var(--color-good)_20%,transparent)] bg-[color-mix(in_srgb,var(--color-good)_6%,transparent)]'
            : game.status === 'finished' && game.winner === 'evil'
              ? 'border-[color-mix(in_srgb,var(--color-evil)_20%,transparent)] bg-[color-mix(in_srgb,var(--color-evil)_6%,transparent)]'
              : game.status === 'in_progress'
                ? 'border-amber-500/20 bg-amber-500/[0.06]'
                : 'border-green-500/20 bg-green-500/[0.06]',
        ]"
      >
        <div
          class="flex flex-col gap-4 sm:flex-row
            sm:items-center sm:justify-between"
        >
          <div>
            <div class="flex items-center gap-3">
              <h1
                class="font-heading text-2xl font-bold
                  tracking-tight sm:text-3xl"
              >
                {{ formatDateLong(game.date) }}
              </h1>
              <Tag
                v-if="statusInfo && game.status !== 'finished'"
                :value="statusInfo.labelUa"
                :severity="statusInfo.severity"
                rounded
                class="!text-xs"
              >
                <template #default>
                  <i
                    :class="statusInfo.icon"
                    class="mr-1 text-xs"
                  />
                  {{ statusInfo.labelUa }}
                </template>
              </Tag>
            </div>

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
                class="hidden items-center gap-1.5
                  text-sm text-text-muted lg:flex"
              >
                <i class="pi pi-book" />
                {{ game.storyteller.nickname }}
              </span>
              <!-- MVP: mobile -->
              <NuxtLink
                v-if="mvpPlayer"
                :to="`/players/${mvpPlayer.id}`"
                class="inline-flex items-center gap-1
                  text-sm text-accent transition-opacity
                  hover:opacity-80 lg:hidden"
              >
                <i class="pi pi-star-fill" />
                {{ mvpPlayer.nickname }}
              </NuxtLink>
            </div>
          </div>

          <!-- Right side badges (desktop) -->
          <div class="hidden items-stretch gap-4 lg:flex">
            <!-- MVP badge: desktop -->
            <NuxtLink
              v-if="mvpPlayer"
              :to="`/players/${mvpPlayer.id}`"
              class="flex shrink-0 flex-col items-center
                justify-center gap-1 rounded-xl
                bg-accent/10 px-5 py-3 text-accent
                transition-opacity hover:opacity-80"
            >
              <span class="relative">
                <PlayerAvatar
                  :avatar-url="mvpPlayer.avatar_url"
                  :nickname="mvpPlayer.nickname"
                  size="sm"
                  ring-class="ring-1 ring-accent/40"
                />
                <i
                  class="pi pi-star-fill absolute
                    -right-1 -top-1 text-[10px]
                    text-accent drop-shadow-sm"
                />
              </span>
              <span class="text-xs font-medium">
                {{ mvpPlayer.nickname }}
              </span>
            </NuxtLink>

            <!-- Winner badge (finished only) -->
            <div
              v-if="game.winner"
              class="flex items-center justify-center
                gap-3 rounded-xl px-5 py-3"
              :class="[
                game.winner === 'good'
                  ? 'bg-[color-mix(in_srgb,var(--color-good)_15%,transparent)]'
                  : 'bg-[color-mix(in_srgb,var(--color-evil)_15%,transparent)]',
              ]"
            >
              <div>
                <p
                  class="text-xs uppercase
                    tracking-wider text-text-muted"
                >
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
                    class="font-heading text-lg
                      font-bold sm:text-xl"
                    :class="[
                      game.winner === 'good'
                        ? 'text-good'
                        : 'text-evil',
                    ]"
                  >
                    {{
                      winnerInfo?.labelUa
                        ?? game.winner
                    }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Admin status transition controls -->
        <ClientOnly>
          <div
            v-if="isAdmin && game.status !== 'finished'"
            class="mt-4 border-t border-white/[0.06] pt-6"
          >
            <div class="flex justify-end">
              <!-- Upcoming -> In progress -->
              <Button
                v-if="game.status === 'upcoming'"
                label="Гра відбулася"
                icon="pi pi-play"
                size="small"
                severity="warn"
                :loading="transitioning"
                @click="transitionStatus('in_progress')"
              />

              <!-- In progress -> Finish -->
              <Button
                v-if="game.status === 'in_progress'"
                label="Завершити гру"
                size="small"
                icon="pi pi-lock"
                @click="showFinishDialog = true"
              />
            </div>
          </div>
        </ClientOnly>

        <!-- Notes -->
        <p
          v-if="game.notes"
          class="mt-4 rounded-lg border
            border-white/[0.06] bg-white/[0.03]
            px-4 py-3 text-sm leading-relaxed
            text-text-muted"
        >
          {{ game.notes }}
        </p>
      </div>

      <!-- Players -->
      <GamePlayersPanel
        ref="panelRef"
        :game-id="gameId"
        :winner="game.winner"
        :game-status="game.status"
        :initial-players="game.game_players ?? null"
        :initial-votes="game.mvp_votes ?? null"
        @game-updated="(g) => game = g"
        @player-count-changed="onPlayerCountChanged"
      />
    </template>

    <ConfirmDialog group="delete-game" />

    <!-- Finish game dialog -->
    <Dialog
      v-model:visible="showFinishDialog"
      header="Завершити гру"
      modal
      :style="{ width: '24rem' }"
      :closable="!transitioning"
    >
      <p class="mb-4 text-sm text-text-muted">
        Оберіть переможця, щоб завершити гру
      </p>
      <WinnerSelector
        :model-value="selectedWinner"
        size="sm"
        @update:model-value="selectedWinner = $event as Winner"
      />
      <template #footer>
        <div class="mt-6">
          <Button
            label="Скасувати"
            severity="secondary"
            text
            :disabled="transitioning"
            @click="showFinishDialog = false; selectedWinner = null"
          />
          <Button
            label="Завершити"
            icon="pi pi-lock"
            :disabled="!selectedWinner"
            :loading="transitioning"
            @click="finishGame"
          />
        </div>
      </template>
    </Dialog>
  </div>
</template>
