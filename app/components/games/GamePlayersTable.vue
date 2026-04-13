<script setup lang="ts">
import type { GamePlayerWithDetails } from '~/composables/useGamePlayers'
import GamePlayerDesktopRow
  from '~/components/games/GamePlayerDesktopRow.vue'
import GamePlayerMobileCard
  from '~/components/games/GamePlayerMobileCard.vue'

const props = defineProps<{
  players: GamePlayerWithDetails[]
  currentUserId?: string | null
  isAdmin?: boolean
  winner?: 'good' | 'evil' | null
  gameStatus?: string
}>()

const emit = defineEmits<{
  'edit-entry': [entry: GamePlayerWithDetails]
  'delete-entry': [entry: GamePlayerWithDetails]
}>()

const isFinished = computed(
  () => props.gameStatus === 'finished',
)
</script>

<template>
  <div
    class="overflow-hidden rounded-xl
      border border-white/[0.06]"
    data-testid="game-players-table"
  >
    <!-- Desktop table -->
    <table class="hidden w-full sm:table">
      <thead>
        <tr class="border-b border-white/[0.08] text-left">
          <th
            class="px-6 py-4 text-sm font-semibold
              tracking-wide text-text-muted"
          >
            Гравець
          </th>
          <th
            class="px-6 py-4 text-sm font-semibold
              tracking-wide text-text-muted"
          >
            Роль
          </th>
          <th
            class="px-6 py-4 text-sm font-semibold
              tracking-wide text-text-muted"
          >
            Бік
          </th>
          <th
            class="px-6 py-4 text-sm font-semibold
              tracking-wide text-text-muted"
          >
            Статус
          </th>
          <th
            v-if="winner"
            class="px-6 py-4"
          />
          <th
            v-if="isFinished"
            class="px-6 py-4 text-sm font-semibold
              tracking-wide text-text-muted"
          >
            Бали
          </th>
          <th
            v-if="currentUserId || isAdmin"
            class="px-6 py-4"
          />
        </tr>
      </thead>
      <tbody>
        <GamePlayerDesktopRow
          v-for="entry in players"
          :key="entry.id"
          :entry="entry"
          :current-user-id="currentUserId"
          :is-admin="isAdmin"
          :winner="winner"
          :game-status="gameStatus"
          @edit-entry="emit('edit-entry', $event)"
          @delete-entry="emit('delete-entry', $event)"
        />
      </tbody>
    </table>

    <!-- Mobile card layout -->
    <div
      class="flex flex-col divide-y
        divide-white/[0.04] sm:hidden"
    >
      <GamePlayerMobileCard
        v-for="entry in players"
        :key="entry.id"
        :entry="entry"
        :current-user-id="currentUserId"
        :is-admin="isAdmin"
        :winner="winner"
        :game-status="gameStatus"
        @edit-entry="emit('edit-entry', $event)"
        @delete-entry="emit('delete-entry', $event)"
      />
    </div>

    <div
      v-if="!players.length"
      class="py-12 text-center text-text-muted"
    >
      <i
        class="pi pi-users mb-2 text-6xl text-text-subtle"
      />
      <p>Немає гравців</p>
    </div>
  </div>
</template>
