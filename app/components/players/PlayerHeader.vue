<script setup lang="ts">
import type { Profile } from '~/types'
import { formatDate } from '~/utils/date'
import PlayerAvatar
  from '~/components/players/PlayerAvatar.vue'
import WinStreakBadge
  from '~/components/players/WinStreakBadge.vue'

defineProps<{
  player: Profile
  lastGameDate?: string | null
  winStreak?: number
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
        <div class="flex items-center gap-2">
          <h1
            class="truncate font-heading text-2xl
              font-bold tracking-tight sm:text-3xl"
          >
            {{ player.nickname }}
          </h1>
          <Tag
            v-if="player.is_manual"
            value="ручний"
            severity="warn"
            class="shrink-0 text-[10px]"
          />
        </div>

        <!-- Meta row -->
        <div
          class="mt-2 flex items-center
            justify-between gap-2"
        >
          <span
            v-if="lastGameDate"
            class="flex items-center gap-1
              text-xs text-text-muted sm:text-sm"
          >
            <i
              class="pi pi-clock text-[10px]
                text-text-subtle"
            />
            Остання:
            {{ formatDate(lastGameDate) }}
          </span>
          <WinStreakBadge
            v-if="winStreak"
            :streak="winStreak"
          />
        </div>
      </div>
    </div>
  </div>
</template>
