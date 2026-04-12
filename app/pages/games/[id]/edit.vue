<script setup lang="ts">
import GameForm from '~/components/games/GameForm.vue'
import { getGameStatusInfo } from '~/composables/useGameLabels'
import { extractErrorMessage } from '~/utils/error'

definePageMeta({ middleware: ['admin'] })

const route = useRoute()
const router = useRouter()
const { success: toastSuccess, error: toastError } = useAppToast()
const gameId = route.params.id as string

const { getById, update } = useGames()
const { players: allPlayers } = usePlayers()

const { data: game, status: gameStatus } = useAsyncData(
  `game-edit-${gameId}`,
  () => getById(gameId),
)

const statusInfo = computed(() =>
  game.value ? getGameStatusInfo(game.value.status) : null,
)

const gameFormRef = ref()
const saving = ref(false)

function triggerSubmit() {
  gameFormRef.value?.$el?.requestSubmit()
}

async function handleRevertStatus() {
  if (!game.value) return
  const target = game.value.status === 'finished'
    ? 'in_progress'
    : 'upcoming'
  const updates: Record<string, unknown> = { status: target }
  if (target === 'in_progress') updates.winner = null

  saving.value = true
  try {
    await update(gameId, updates)

    const info = getGameStatusInfo(target)
    toastSuccess(`Статус: ${info?.labelUa}`)
    router.push(`/games/${gameId}`)
  }
  catch (err) {
    toastError(extractErrorMessage(err, 'Не вдалося оновити гру'))
  }
  finally {
    saving.value = false
  }
}

async function handleSubmit(data: {
  date: string
  script: string
  custom_script_name: string | null
  winner: string | null
  storyteller_id: string | null
  notes: string | null
}) {
  saving.value = true
  try {
    await update(gameId, data)

    toastSuccess('Гру оновлено')
    router.push(`/games/${gameId}`)
  }
  catch (err) {
    toastError(extractErrorMessage(err, 'Не вдалося оновити гру'))
  }
  finally {
    saving.value = false
  }
}

const revertTarget = computed(() => {
  if (!game.value) return null
  if (game.value.status === 'finished') return getGameStatusInfo('in_progress')
  if (game.value.status === 'in_progress') return getGameStatusInfo('upcoming')
  return null
})
</script>

<template>
  <div>
    <NuxtLink
      :to="`/games/${gameId}`"
      class="mb-4 inline-flex items-center gap-1
        text-sm text-text-muted hover:text-text"
    >
      <i class="pi pi-arrow-left" />
      Назад до гри
    </NuxtLink>

    <div class="mb-6 flex items-center gap-3">
      <h1 class="font-heading text-2xl font-bold">
        Редагувати гру
      </h1>
      <Tag
        v-if="statusInfo"
        :severity="statusInfo.severity"
        rounded
        class="!text-xs"
      >
        <i
          :class="statusInfo.icon"
          class="mr-1 text-xs"
        />
        {{ statusInfo.labelUa }}
      </Tag>
    </div>

    <div
      v-if="gameStatus === 'pending'"
      class="space-y-4"
    >
      <Skeleton height="20rem" />
    </div>

    <div
      v-else-if="!game"
      class="text-center text-text-muted"
    >
      <p>Гру не знайдено</p>
    </div>

    <template v-else>
      <GameForm
        ref="gameFormRef"
        :initial-data="{
          date: game.date,
          script: game.script,
          custom_script_name: game.custom_script_name,
          winner: game.winner,
          storyteller_id: game.storyteller_id,
          notes: game.notes,
        }"
        :players="allPlayers ?? []"
        :loading="saving"
        :show-winner="game.status === 'finished'"
        @submit="handleSubmit"
      />
    </template>

    <!-- Action bar -->
    <div
      class="sticky bottom-0 z-40 -mx-4 mt-8 border-t
        border-white/[0.08]
        bg-[var(--botc-night-950)]/95 backdrop-blur-sm
        sm:-mx-6"
    >
      <div
        class="flex items-center justify-between
          px-4 py-3 sm:px-6"
      >
        <!-- Revert status (left) -->
        <div>
          <Button
            v-if="revertTarget"
            :label="revertTarget.labelUa"
            :icon="revertTarget.icon"
            :severity="revertTarget.severity"
            :loading="saving"
            size="small"
            @click="handleRevertStatus"
          />
        </div>

        <!-- Save / Cancel (right) -->
        <div class="flex items-center gap-3">
          <NuxtLink :to="`/games/${gameId}`">
            <Button
              label="Скасувати"
              severity="secondary"
              text
              type="button"
            />
          </NuxtLink>
          <Button
            label="Зберегти"
            icon="pi pi-check"
            :loading="saving"
            data-testid="game-submit"
            @click="triggerSubmit"
          />
        </div>
      </div>
    </div>
  </div>
</template>
