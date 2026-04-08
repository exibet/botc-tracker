<script setup lang="ts">
import type { Profile, PlayerStats } from '~/types'
import { formatDate } from '~/utils/date'
import PlayerAvatar
  from '~/components/players/PlayerAvatar.vue'

defineProps<{
  player: Profile
  lastGameDate?: string | null
  stats: PlayerStats
}>()
</script>

<template>
  <div
    class="relative overflow-hidden rounded-xl
      border border-white/[0.06]"
    style="background: linear-gradient(
      135deg,
      rgba(192, 57, 43, 0.08) 0%,
      rgba(26, 26, 46, 1) 40%,
      rgba(17, 17, 34, 1) 100%
    )"
  >
    <!-- Top accent line -->
    <div
      class="absolute inset-x-0 top-0 h-px
        bg-gradient-to-r from-transparent
        via-primary/40 to-transparent"
    />

    <div
      class="relative flex flex-row items-center
        gap-4 p-4 sm:gap-5 sm:p-5"
    >
      <!-- Avatar area -->
      <div class="relative shrink-0">
        <PlayerAvatar
          :avatar-url="player.avatar_url"
          :nickname="player.nickname"
          size="lg"
          ring-class="ring-2 ring-primary/30"
        />
        <!-- Glow behind avatar -->
        <div
          class="pointer-events-none absolute -inset-2
            -z-10 rounded-full
            bg-primary/[0.06] blur-xl"
        />
      </div>

      <!-- Info -->
      <div class="min-w-0 flex-1">
        <h1
          class="truncate font-heading text-2xl
            font-bold tracking-tight sm:text-3xl"
        >
          {{ player.nickname }}
        </h1>

        <!-- Meta row -->
        <div
          class="mt-1 flex flex-wrap items-center
            gap-x-3 gap-y-0.5
            text-xs text-text-muted sm:text-sm"
        >
          <span class="flex items-center gap-1">
            <i
              class="pi pi-calendar text-[10px]
                text-text-subtle"
            />
            З {{ formatDate(player.created_at) }}
          </span>
          <template v-if="lastGameDate">
            <span class="text-white/[0.15]">|</span>
            <span class="flex items-center gap-1">
              <i
                class="pi pi-clock text-[10px]
                  text-text-subtle"
              />
              Остання:
              {{ formatDate(lastGameDate) }}
            </span>
          </template>
        </div>

        <!-- MVP achievement badge -->
        <div
          v-if="stats.mvpCount > 0"
          class="mt-3 inline-flex items-center gap-1.5
            rounded-full bg-accent/15 px-3 py-1
            text-xs font-bold text-accent
            ring-1 ring-accent/30"
        >
          <i class="pi pi-star-fill text-[11px]" />
          {{ stats.mvpCount }} MVP
        </div>

      </div>
    </div>
  </div>
</template>
