<script setup lang="ts">
import GameForm from '~/components/games/GameForm.vue'
import PlayerRoleSelector from '~/components/games/PlayerRoleSelector.vue'
import type { PlayerEntry } from '~/components/games/PlayerRoleSelector.vue'

definePageMeta({ middleware: ['admin'] })

const router = useRouter()
const toast = useToast()
const { create } = useGames()
const { players } = usePlayers()
const { roles } = useRoles()
const { profile } = useAuth()

const playerEntries = ref<PlayerEntry[]>([])
const saving = ref(false)

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
    const game = await create({
      ...data,
      player_count: playerEntries.value.length || null,
    })

    // Add players to the game
    const client = useSupabaseClient()
    for (const entry of playerEntries.value) {
      const { error } = await client
        .from('game_players')
        .insert({
          game_id: game.id,
          player_id: entry.player_id,
          starting_role_id: entry.starting_role_id,
          alignment_start: entry.alignment_start,
          is_alive: entry.is_alive,
          is_mvp: entry.is_mvp,
          added_by: profile.value!.id,
        })
      if (error) throw error
    }

    toast.add({
      severity: 'success',
      summary: 'Гру створено',
      life: 3000,
    })
    router.push(`/games/${game.id}`)
  }
  catch (err) {
    toast.add({
      severity: 'error',
      summary: 'Помилка створення гри',
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
      to="/games"
      class="mb-4 inline-flex items-center gap-1
        text-sm text-text-muted hover:text-text"
    >
      <i class="pi pi-arrow-left text-xs" />
      Ігри
    </NuxtLink>

    <h1 class="mb-6 font-heading text-2xl font-bold">
      Нова гра
    </h1>

    <GameForm
      :players="players ?? []"
      :loading="saving"
      @submit="handleSubmit"
    />

    <div class="mt-8">
      <PlayerRoleSelector
        v-model="playerEntries"
        :players="players ?? []"
        :roles="roles ?? []"
      />
    </div>
  </div>
</template>
