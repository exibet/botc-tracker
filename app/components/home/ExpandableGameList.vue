<script setup lang="ts">
import type { GameWithDetails } from '~/types'
import GameCard from '~/components/games/GameCard.vue'
import GamePlayersPanel
  from '~/components/games/GamePlayersPanel.vue'
import { formatDateWithWeekday } from '~/utils/date'

const props = defineProps<{
  games: GameWithDetails[]
  expandedGameId: string | null
}>()

const emit = defineEmits<{
  'toggle': [gameId: string]
  'player-count-changed': [gameId: string, count: number]
}>()

function isExpanded(gameId: string) {
  return props.expandedGameId === gameId
}
</script>

<template>
  <div class="space-y-4">
    <template
      v-for="(game, index) in games"
      :key="game.id"
    >
      <p
        v-if="index === 0
          || game.date !== games[index - 1]!.date"
        class="text-right text-xs font-medium
          uppercase tracking-wide
          text-text-subtle"
        :class="{ 'pt-2': index !== 0 }"
      >
        {{ formatDateWithWeekday(game.date) }}
      </p>
      <div
        class="cursor-pointer
          [&_a]:pointer-events-none"
        @click="emit('toggle', game.id)"
      >
        <GameCard
          :game="game"
          :class="isExpanded(game.id)
            ? '!rounded-b-none !border-b-0'
            : ''"
        />
      </div>
      <Transition
        enter-active-class="transition-all
          duration-200 ease-out"
        leave-active-class="transition-all
          duration-150 ease-in"
        enter-from-class="max-h-0 opacity-0"
        enter-to-class="max-h-[32rem]
          opacity-100"
        leave-from-class="max-h-[32rem]
          opacity-100"
        leave-to-class="max-h-0 opacity-0"
      >
        <div
          v-if="isExpanded(game.id)"
          class="overflow-hidden rounded-b-xl
            border border-t-0
            border-white/[0.06]"
        >
          <GamePlayersPanel
            :game-id="game.id"
            :winner="game.winner"
            :game-status="game.status"
            :initial-players="game.game_players ?? null"
            :initial-votes="game.mvp_votes ?? null"
            @player-count-changed="(count: number) => emit('player-count-changed', game.id, count)"
          />
        </div>
      </Transition>
    </template>
  </div>
</template>
