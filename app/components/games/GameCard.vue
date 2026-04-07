<script setup lang="ts">
import type { GameWithDetails } from '~/types'
import {
  getScriptLabel,
  getWinnerInfo,
} from '~/composables/useGameLabels'

const props = defineProps<{
  game: GameWithDetails
}>()

const winnerInfo = computed(
  () => getWinnerInfo(props.game.winner),
)
</script>

<template>
  <NuxtLink
    :to="`/games/${game.id}`"
    class="group block rounded-xl border
      border-white/[0.06] p-5
      transition-all duration-200
      hover:border-white/[0.12] hover:bg-white/[0.03]
      sm:p-6"
    :class="[
      game.winner === 'good'
        ? 'hover:shadow-[0_0_24px_-6px_var(--color-good)]'
        : 'hover:shadow-[0_0_24px_-6px_var(--color-evil)]',
    ]"
    data-testid="game-card"
  >
    <div class="flex items-start gap-4 sm:gap-6">
      <!-- Winner badge -->
      <div
        class="flex size-14 shrink-0 flex-col
          items-center justify-center rounded-lg
          sm:size-16 gap-1"
        :class="[
          game.winner === 'good'
            ? 'bg-[color-mix(in_srgb,var(--color-good)_12%,transparent)] ring-1 ring-[color-mix(in_srgb,var(--color-good)_25%,transparent)]'
            : 'bg-[color-mix(in_srgb,var(--color-evil)_12%,transparent)] ring-1 ring-[color-mix(in_srgb,var(--color-evil)_25%,transparent)]',
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
        <span
          class="mt-0.5 text-[10px] font-semibold
            uppercase tracking-wide"
          :class="[
            game.winner === 'good'
              ? 'text-good'
              : 'text-evil',
          ]"
        >
          {{ winnerInfo?.labelUa }}
        </span>
      </div>

      <!-- Game info -->
      <div class="min-w-0 flex-1">
        <div class="flex flex-wrap items-center gap-2">
          <Tag
            :value="getScriptLabel(game.script)"
            severity="secondary"
            rounded
          />
        </div>

        <div
          class="mt-3 flex flex-wrap gap-4 text-sm
            text-text-muted sm:gap-6"
        >
          <span
            v-if="game.player_count"
            class="flex items-center gap-1.5"
          >
            <i class="pi pi-users text-sm" />
            {{ game.player_count }} гравців
          </span>
          <span
            v-if="game.storyteller"
            class="flex items-center gap-1.5"
          >
            <i class="pi pi-book text-sm" />
            {{ game.storyteller.nickname }}
          </span>
        </div>

        <p
          v-if="game.notes"
          class="mt-2 line-clamp-1 text-sm text-text-subtle"
        >
          {{ game.notes }}
        </p>
      </div>

      <!-- Arrow -->
      <i
        class="pi pi-chevron-right shrink-0 pt-1
          text-sm text-text-subtle transition-transform
          duration-200 group-hover:translate-x-0.5"
      />
    </div>
  </NuxtLink>
</template>
