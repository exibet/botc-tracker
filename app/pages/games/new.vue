<script setup lang="ts">
import GameForm from '~/components/games/GameForm.vue'

definePageMeta({ middleware: ['admin'] })

const router = useRouter()
const { success: toastSuccess } = useAppToast()
const { create } = useGameActions()
const { players, initPlayers } = usePlayers()
await initPlayers()

const gameFormRef = ref()
const saving = ref(false)

function triggerSubmit() {
  gameFormRef.value?.$el?.requestSubmit()
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
    await create({
      ...data,
      player_count: 0,
    })

    toastSuccess('Гру створено')
    router.push('/games')
  }
  catch {
    // Error toast shown by $api
  }
  finally {
    saving.value = false
  }
}
</script>

<template>
  <div>
    <NuxtLink
      to="/games"
      class="mb-4 inline-flex items-center gap-1
        text-sm text-text-muted hover:text-text"
    >
      <i class="pi pi-arrow-left" />
      Ігри
    </NuxtLink>

    <h1 class="mb-6 font-heading text-2xl font-bold">
      Нова гра
    </h1>

    <GameForm
      ref="gameFormRef"
      :players="players ?? []"
      :loading="saving"
      @submit="handleSubmit"
    />

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
        <NuxtLink to="/games">
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
