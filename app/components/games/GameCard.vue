<script setup lang="ts">
import type { GameWithDetails } from '~/types'
import {
  getScriptLabel,
  getWinnerInfo,
} from '~/composables/useGameLabels'
import PlayerAvatar
  from '~/components/players/PlayerAvatar.vue'

const props = defineProps<{
  game: GameWithDetails
}>()

const winnerInfo = computed(
  () => getWinnerInfo(props.game.winner),
)

const sideCounts = computed(() => {
  if (!props.game.game_players?.length) return null
  let good = 0
  let evil = 0
  for (const p of props.game.game_players) {
    const t = p.starting_role?.type
    if (t === 'townsfolk' || t === 'outsider') good++
    else if (t === 'minion' || t === 'demon') evil++
  }
  return { good, evil }
})

const mvpPlayer = computed(
  () => props.game.mvp_player ?? null,
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
            {{ game.player_count }}
            <span class="hidden sm:inline">
              гравців
            </span>
          </span>
          <template v-if="sideCounts">
            <span
              class="inline-flex items-center gap-1
                rounded-full bg-good/10 px-1.5 py-0.5
                text-[10px] font-semibold text-good"
            >
              <i class="pi pi-sun text-[8px]" />
              {{ sideCounts.good }}
            </span>
            <span
              class="inline-flex items-center gap-1
                rounded-full bg-evil/10 px-1.5 py-0.5
                text-[10px] font-semibold text-evil"
            >
              <i class="pi pi-moon text-[8px]" />
              {{ sideCounts.evil }}
            </span>
          </template>
          <span
            v-if="game.storyteller"
            class="flex items-center gap-1.5"
          >
            <i class="pi pi-book text-sm" />
            {{ game.storyteller.nickname }}
          </span>
          <!-- MVP: mobile -->
          <NuxtLink
            v-if="mvpPlayer"
            :to="`/players/${mvpPlayer.id}`"
            class="inline-flex items-center gap-1
              text-accent transition-opacity
              hover:opacity-80 lg:hidden"
            @click.stop
          >
            <i class="pi pi-star-fill text-xs" />
            {{ mvpPlayer.nickname }}
          </NuxtLink>
        </div>

      </div>

      <!-- MVP: desktop -->
      <NuxtLink
        v-if="mvpPlayer"
        :to="`/players/${mvpPlayer.id}`"
        class="hidden shrink-0 flex-col items-center
          gap-1 self-center px-4 text-accent
          transition-opacity hover:opacity-80
          lg:flex"
        @click.stop
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

      <!-- Arrow -->
      <i
        class="pi pi-chevron-right shrink-0 pt-1
          text-sm text-text-subtle transition-transform
          duration-200 group-hover:translate-x-0.5"
      />
    </div>
  </NuxtLink>
</template>
