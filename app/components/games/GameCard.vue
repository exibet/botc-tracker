<script setup lang="ts">
import type { Game } from '~/types'
import {
  getScriptLabel,
  getWinnerInfo,
} from '~/composables/useGameLabels'

defineProps<{
  game: Game & {
    storyteller: { id: string, nickname: string } | null
    created_by_profile: { id: string, nickname: string }
  }
}>()

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('uk-UA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
</script>

<template>
  <NuxtLink
    :to="`/games/${game.id}`"
    class="block border-b border-white/[0.06]
      px-4 py-4 transition-colors duration-150
      hover:bg-white/[0.03] sm:px-6"
    data-testid="game-card"
  >
    <div class="flex items-center justify-between gap-4">
      <div class="min-w-0 flex-1">
        <div
          class="flex flex-col gap-1
            sm:flex-row sm:items-center sm:gap-3"
        >
          <p class="text-base font-semibold text-text">
            {{ formatDate(game.date) }}
          </p>
          <div class="flex items-center gap-2">
            <Tag
              :value="getScriptLabel(game.script)"
              severity="secondary"
              rounded
            />
            <Tag
              :value="getWinnerInfo(game.winner)?.labelUa
                ?? game.winner"
              :severity="getWinnerInfo(game.winner)?.severity
                ?? 'secondary'"
              rounded
            />
          </div>
        </div>
        <div class="mt-1 flex gap-4 text-sm text-text-muted">
          <span
            v-if="game.player_count"
            class="flex items-center gap-1"
          >
            <i class="pi pi-users text-xs" />
            {{ game.player_count }}
          </span>
          <span
            v-if="game.storyteller"
            class="flex items-center gap-1"
          >
            <i class="pi pi-book text-xs" />
            {{ game.storyteller.nickname }}
          </span>
        </div>
      </div>
      <i
        class="pi pi-chevron-right shrink-0
          text-xs text-text-subtle"
      />
    </div>
  </NuxtLink>
</template>
