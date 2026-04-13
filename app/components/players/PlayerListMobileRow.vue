<script setup lang="ts">
import type { PlayerWithStats } from '#shared/types'
import { rankDisplay } from '~/utils/display'
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
</script>

<template>
  <div
    class="cursor-pointer border-b border-white/[0.04]
      px-4 py-4 transition-colors duration-150
      last:border-b-0 lg:hidden"
    :class="isExpanded
      ? 'bg-white/[0.06]'
      : 'hover:bg-white/[0.04]'"
    @click="$emit('toggle')"
  >
    <div class="flex items-center gap-3">
      <!-- Rank -->
      <span
        class="w-5 shrink-0 text-center tabular-nums"
        :class="podiumRank
          ? 'text-sm' : 'text-xs text-text-subtle/50'"
      >
        {{ rankDisplay(index, podiumRank) }}
      </span>

      <!-- Avatar -->
      <NuxtLink
        :to="`/players/${player.id}`"
        class="shrink-0"
        @click.stop
      >
        <PlayerAvatar
          :avatar-url="player.avatar_url"
          :nickname="player.nickname"
          ring-class="ring-1 ring-white/[0.06]"
        />
      </NuxtLink>

      <!-- Name + stats -->
      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-1.5">
          <span
            class="truncate text-sm font-semibold"
          >
            {{ player.nickname }}
          </span>
        </div>
        <div
          class="mt-0.5 flex items-center gap-2
            text-xs text-text-muted"
        >
          <span>{{ player.gamesPlayed }} ігор</span>
          <span class="text-white/[0.15]">|</span>
          <span
            :class="player.winRate >= 50
              ? 'text-win' : ''"
          >
            {{ player.gamesPlayed > 0
              ? `${player.winRate}%` : '\u2014' }}
          </span>
          <template v-if="player.points > 0">
            <span class="text-white/[0.15]">|</span>
            <span class="text-accent">
              {{ player.points }} б.
            </span>
          </template>
        </div>
      </div>

      <!-- W/L compact -->
      <div class="flex shrink-0 items-center gap-2">
        <span
          class="inline-flex w-7 justify-center rounded
            bg-win/10 py-0.5 text-[10px] font-semibold
            text-win"
        >
          {{ player.wins }}W
        </span>
        <span
          class="inline-flex w-7 justify-center rounded
            bg-white/[0.04] py-0.5 text-[10px]
            font-semibold text-text-muted"
        >
          {{ player.losses }}L
        </span>
      </div>
    </div>
  </div>
</template>
