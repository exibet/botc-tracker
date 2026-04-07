<script setup lang="ts">
import type { PlayerEntry } from '~/types'
import GameForm from '~/components/games/GameForm.vue'
import PlayerRoleSelector
  from '~/components/games/PlayerRoleSelector.vue'

definePageMeta({ middleware: ['admin'] })

const route = useRoute()
const router = useRouter()
const toast = useToast()
const gameId = route.params.id as string

const { getById, update } = useGames()
const {
  players: gamePlayers,
  syncFromEntries,
} = useGamePlayers(gameId)
const { players: allPlayers } = usePlayers()
const { roles } = useRoles()
const { profile } = useAuth()

const { data: game, status: gameStatus } = useAsyncData(
  `game-edit-${gameId}`,
  () => getById(gameId),
)

const gameFormRef = ref()
const playerEntries = ref<PlayerEntry[]>([])
const saving = ref(false)
const initialized = ref(false)

function triggerSubmit() {
  gameFormRef.value?.$el?.requestSubmit()
}

// Populate playerEntries from existing game players
watch(
  [gamePlayers, () => initialized.value],
  ([gp]) => {
    if (!gp || initialized.value) return
    playerEntries.value = gp.map(p => ({
      player_id: p.player_id,
      nickname: p.player.nickname,
      starting_role_id: p.starting_role_id,
      role_name: p.starting_role.name_ua,
      alignment_start: p.alignment_start,
      ending_role_id: p.ending_role_id ?? null,
      ending_role_name: p.ending_role?.name_ua ?? null,
      alignment_end: p.alignment_end ?? null,
      is_alive: p.is_alive,
      is_mvp: p.is_mvp,
    }))
    initialized.value = true
  },
  { immediate: true },
)

async function handleSubmit(data: {
  date: string
  script: string
  custom_script_name: string | null
  winner: string
  storyteller_id: string | null
  notes: string | null
}) {
  saving.value = true
  try {
    await update(gameId, {
      ...data,
      player_count: playerEntries.value.length || null,
    })

    await syncFromEntries(
      playerEntries.value,
      profile.value!.id,
    )

    clearNuxtData(`game-${gameId}`)
    clearNuxtData(`game-players-${gameId}`)

    toast.add({
      severity: 'success',
      summary: 'Гру оновлено',
      life: 3000,
    })
    router.push(`/games/${gameId}`)
  }
  catch (err) {
    toast.add({
      severity: 'error',
      summary: 'Помилка оновлення гри',
      detail: String(err),
      life: 5000,
    })
  }
  finally {
    saving.value = false
  }
}
</script>

<template>
  <div>
    <NuxtLink
      :to="`/games/${gameId}`"
      class="mb-4 inline-flex items-center gap-1
        text-sm text-text-muted hover:text-text"
    >
      <i class="pi pi-arrow-left text-xs" />
      Назад до гри
    </NuxtLink>

    <h1 class="mb-6 font-heading text-2xl font-bold">
      Редагувати гру
    </h1>

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
        @submit="handleSubmit"
      />

      <div class="mt-8">
        <PlayerRoleSelector
          v-model="playerEntries"
          :players="allPlayers ?? []"
          :roles="roles ?? []"
        />
      </div>
    </template>

    <!-- Action bar -->
    <div
      class="sticky bottom-0 z-40 -mx-4 mt-8 border-t
        border-white/[0.08]
        bg-[var(--botc-night-950)]/95 backdrop-blur-sm
        sm:-mx-6"
    >
      <div
        class="flex items-center justify-end gap-3
          px-4 py-3 sm:px-6"
      >
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
</template>
