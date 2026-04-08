<script setup lang="ts">
import type { PlayerWithStats } from '~/types'
import PlayerAvatar
  from '~/components/players/PlayerAvatar.vue'

defineProps<{
  player: PlayerWithStats
  index: number
  isExpanded: boolean
  podiumRank: 'gold' | 'silver' | 'bronze' | null
}>()

defineEmits<{
  toggle: []
}>()

function rankDisplay(
  index: number,
  rank: 'gold' | 'silver' | 'bronze' | null,
): string {
  if (rank === 'gold') return '\u{1F451}'
  if (rank === 'silver') return '\u{1F948}'
  if (rank === 'bronze') return '\u{1F949}'
  return String(index + 1)
}
</script>

<template>
  <div
    class="hidden cursor-pointer items-center
      border-b border-white/[0.04] px-6
      transition-colors duration-150
      last:border-b-0 lg:grid"
    :class="isExpanded
      ? 'bg-white/[0.06]'
      : 'hover:bg-white/[0.04]'"
    style="grid-template-columns:
      2.5rem 1fr 4.5rem 4.5rem 4.5rem 6rem
      4.5rem 3.5rem 3.5rem; column-gap: 1rem"
    @click="$emit('toggle')"
  >
    <!-- Rank -->
    <div class="py-4">
      <span
        class="text-base tabular-nums"
        :class="podiumRank
          ? 'text-lg' : 'text-text-subtle/50'"
      >
        {{ rankDisplay(index, podiumRank) }}
      </span>
    </div>

    <!-- Player -->
    <div class="flex items-center gap-3 py-4">
      <PlayerAvatar
        :avatar-url="player.avatar_url"
        :nickname="player.nickname"
        ring-class="ring-1 ring-white/[0.06]"
      />
      <NuxtLink
        :to="`/players/${player.id}`"
        class="truncate text-base font-semibold
          transition-colors hover:text-primary"
        @click.stop
      >
        {{ player.nickname }}
      </NuxtLink>
    </div>

    <!-- Points -->
    <div class="py-4 text-center">
      <span
        v-if="player.points > 0"
        class="text-base tabular-nums
          font-semibold text-accent"
      >
        {{ player.points }}
      </span>
      <span v-else class="text-xs text-text-subtle">
        &mdash;
      </span>
    </div>

    <!-- Games -->
    <div class="py-4 text-center">
      <span class="text-base tabular-nums text-text">
        {{ player.gamesPlayed }}
      </span>
    </div>

    <!-- Win% -->
    <div class="py-4 text-center">
      <span
        class="text-base tabular-nums font-medium"
        :class="player.winRate >= 50
          ? 'text-win'
          : player.gamesPlayed > 0
            ? 'text-text-muted'
            : 'text-text-subtle'"
      >
        {{ player.gamesPlayed > 0
          ? `${player.winRate}%` : '\u2014' }}
      </span>
    </div>

    <!-- W / L -->
    <div
      class="flex items-center justify-center
        gap-1.5 py-4"
    >
      <span
        class="inline-flex w-7 justify-center rounded
          bg-win/10 py-0.5 text-xs font-semibold
          tabular-nums text-win"
      >
        {{ player.wins }}
      </span>
      <span class="text-xs text-text-subtle">/</span>
      <span
        class="inline-flex w-7 justify-center rounded
          bg-white/[0.04] py-0.5 text-xs font-semibold
          tabular-nums text-text-muted"
      >
        {{ player.losses }}
      </span>
    </div>

    <!-- MVP -->
    <div class="py-4 text-center">
      <span
        v-if="player.mvpCount > 0"
        class="inline-flex items-center gap-1
          rounded-full bg-accent/10 px-2 py-0.5
          text-xs font-semibold tabular-nums text-accent"
      >
        <i class="pi pi-star-fill text-[9px]" />
        {{ player.mvpCount }}
      </span>
      <span v-else class="text-xs text-text-subtle">
        &mdash;
      </span>
    </div>

    <!-- Good -->
    <div class="py-4 text-center">
      <span
        v-if="player.goodGames > 0"
        class="text-base tabular-nums text-good"
      >
        {{ player.goodGames }}
      </span>
      <span v-else class="text-xs text-text-subtle">
        &mdash;
      </span>
    </div>

    <!-- Evil -->
    <div class="py-4 text-center">
      <span
        v-if="player.evilGames > 0"
        class="text-base tabular-nums text-evil"
      >
        {{ player.evilGames }}
      </span>
      <span v-else class="text-xs text-text-subtle">
        &mdash;
      </span>
    </div>
  </div>
</template>
