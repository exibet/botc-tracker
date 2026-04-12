<script setup lang="ts">
import { formatDateShort } from '~/utils/date'
import RoleAvatar from '~/components/games/RoleAvatar.vue'

const props = defineProps<{
  playerId: string
}>()

const { games, loading } = usePlayerRecentGames(props.playerId)
</script>

<template>
  <div class="px-4 py-4 sm:px-6">
    <!-- Loading -->
    <div
      v-if="loading"
      class="flex flex-col gap-2"
    >
      <div
        v-for="j in 3"
        :key="j"
        class="flex items-center gap-3"
      >
        <Skeleton shape="circle" size="1.75rem" />
        <Skeleton width="6rem" height="0.875rem" />
        <div class="flex-1" />
        <Skeleton width="3rem" height="0.875rem" />
      </div>
    </div>

    <!-- Games loaded -->
    <template v-else-if="games?.length">
      <div class="mb-3 flex items-center justify-between">
        <span
          class="text-xs font-semibold uppercase
            tracking-wider text-text-muted"
        >
          Останні ігри
        </span>
        <NuxtLink
          :to="`/players/${playerId}`"
          class="text-xs text-primary transition-colors
            hover:text-primary/80"
          @click.stop
        >
          Всі ігри &rarr;
        </NuxtLink>
      </div>

      <div class="flex flex-col gap-0.5">
        <NuxtLink
          v-for="game in games"
          :key="game.gameId"
          :to="`/games/${game.gameId}`"
          class="flex items-center gap-3 rounded-lg
            px-3 py-2 transition-colors
            hover:bg-white/[0.04]"
          @click.stop
        >
          <RoleAvatar
            :image-url="game.roleImageUrl"
            :name="game.roleName"
            :type="game.roleType"
            size="sm"
          />
          <span
            class="flex min-w-0 flex-1 items-center
              gap-1.5"
          >
            <span class="truncate text-sm">
              {{ game.roleName }}
            </span>
            <i
              v-if="game.isMvp"
              class="pi pi-star-fill shrink-0
                text-accent text-[10px]"
            />
          </span>
          <span
            class="shrink-0 text-xs text-text-muted"
          >
            {{ formatDateShort(game.date) }}
          </span>
          <span
            class="inline-flex w-7 shrink-0 items-center
              justify-center rounded-full py-0.5
              text-[10px] font-semibold"
            :class="game.won
              ? 'bg-win/10 text-win'
              : 'bg-white/[0.04] text-text-muted'"
          >
            {{ game.won ? 'W' : 'L' }}
          </span>
        </NuxtLink>
      </div>
    </template>

    <!-- No games -->
    <div
      v-else
      class="py-4 text-center text-sm text-text-muted"
    >
      Гравець ще не брав участі в іграх
    </div>
  </div>
</template>
