<script setup lang="ts">
import type { Profile } from '~/types'
import { usePlayerStats } from '~/composables/usePlayerStats'
import PlayerHeader
  from '~/components/players/PlayerHeader.vue'
import PlayerRoleChart
  from '~/components/players/PlayerRoleChart.vue'
import PlayerGameHistory
  from '~/components/players/PlayerGameHistory.vue'

const route = useRoute()
const playerId = route.params.id as string
const client = useSupabaseClient()

const { data: player, status: profileStatus } = useAsyncData(
  `player-profile-${playerId}`,
  async () => {
    const { data, error } = await client
      .from('profiles')
      .select('*')
      .eq('id', playerId)
      .single()

    if (error) throw error
    return data as Profile
  },
)

const {
  stats,
  gameHistory,
  rolePlayCounts,
  winStreak,
  status: statsStatus,
} = usePlayerStats(playerId)

const isLoading = computed(
  () => profileStatus.value === 'pending'
    || statsStatus.value === 'pending',
)

const lastGameDate = computed(() =>
  gameHistory.value.length > 0
    ? gameHistory.value[0].date
    : null,
)

const goodPct = computed(() =>
  stats.value.totalGames
    ? Math.round((stats.value.goodGames / stats.value.totalGames) * 100)
    : 0,
)
const evilPct = computed(() =>
  stats.value.totalGames ? 100 - goodPct.value : 0,
)
</script>

<template>
  <div>
    <!-- Back link -->
    <NuxtLink
      to="/players"
      class="mb-6 inline-flex items-center gap-1.5
        text-sm text-text-muted transition-colors
        hover:text-text"
    >
      <i class="pi pi-arrow-left text-xs" />
      Гравці
    </NuxtLink>

    <!-- Loading state -->
    <div v-if="isLoading" class="flex flex-col gap-6">
      <!-- Header skeleton -->
      <div
        class="rounded-xl border border-white/[0.06]
          bg-surface-card p-5 sm:p-8"
      >
        <div class="flex items-center gap-4">
          <Skeleton
            shape="circle"
            size="5rem"
            class="shrink-0"
          />
          <div class="flex flex-col gap-2">
            <Skeleton width="12rem" height="2rem" />
            <Skeleton width="16rem" height="1rem" />
          </div>
        </div>
      </div>

      <!-- Stats skeleton -->
      <div
        class="grid grid-cols-2 gap-3
          sm:grid-cols-3 lg:grid-cols-6"
      >
        <Skeleton
          v-for="i in 6"
          :key="i"
          height="5rem"
          border-radius="0.75rem"
        />
      </div>

      <!-- Content skeleton -->
      <Skeleton
        height="16rem"
        border-radius="0.75rem"
      />
      <Skeleton
        height="24rem"
        border-radius="0.75rem"
      />
    </div>

    <!-- Error / not found -->
    <div
      v-else-if="profileStatus === 'error' || !player"
      class="flex flex-col items-center
        justify-center py-20 text-center"
    >
      <div
        class="mx-auto mb-4 flex size-20 items-center
          justify-center rounded-full
          bg-white/[0.03]"
      >
        <i
          class="pi pi-user text-4xl text-text-subtle"
        />
      </div>
      <p class="font-heading text-lg font-semibold">
        Гравця не знайдено
      </p>
      <p class="mt-1 max-w-xs text-sm text-text-muted">
        Можливо, профіль було видалено або ID невірний
      </p>
      <NuxtLink to="/players">
        <Button
          label="До списку гравців"
          severity="secondary"
          outlined
          class="mt-5"
          icon="pi pi-arrow-left"
        />
      </NuxtLink>
    </div>

    <!-- Profile content -->
    <div v-else class="flex flex-col gap-6">
      <!-- Header -->
      <PlayerHeader
        :player="player"
        :last-game-date="lastGameDate"
        :stats="stats"
      />

      <!-- Stats banner -->
      <div
        class="rounded-xl
          px-4 py-3 sm:px-5 sm:py-3.5"
      >
        <div
          class="grid grid-cols-4 gap-2 text-center
            sm:gap-4"
        >
          <div>
            <p class="flex items-center justify-center gap-1 font-heading text-lg font-bold text-alive sm:text-xl">
              <i class="pi pi-trophy text-[11px]" />
              {{ stats.wins }}
            </p>
            <p class="text-[11px] text-text-muted">
              Перемог
            </p>
          </div>
          <div>
            <p class="font-heading text-lg font-bold text-text-muted sm:text-xl">
              {{ stats.losses }}
            </p>
            <p class="text-[11px] text-text-muted">
              Поразок
            </p>
          </div>
          <div>
            <p class="flex items-center justify-center gap-1 font-heading text-lg font-bold text-good sm:text-xl">
              <i class="pi pi-sun text-[11px]" />
              {{ stats.goodGames }}
            </p>
            <p class="text-[11px] text-text-muted">
              Добро
            </p>
          </div>
          <div>
            <p class="flex items-center justify-center gap-1 font-heading text-lg font-bold text-evil sm:text-xl">
              <i class="pi pi-moon text-[11px]" />
              {{ stats.evilGames }}
            </p>
            <p class="text-[11px] text-text-muted">
              Зло
            </p>
          </div>
        </div>

        <!-- Good/Evil ratio bar -->
        <div v-if="stats.totalGames > 0" class="mt-3">
          <div
            class="flex h-1.5 overflow-hidden rounded-full
              bg-white/[0.06]"
          >
            <div
              class="rounded-l-full bg-good transition-all
                duration-500"
              :style="{ width: `${goodPct}%` }"
            />
            <div
              class="rounded-r-full bg-evil transition-all
                duration-500"
              :style="{ width: `${evilPct}%` }"
            />
          </div>
          <div
            class="mt-1 flex justify-between text-[10px]
              text-text-subtle"
          >
            <span>{{ goodPct }}% Добро</span>
            <span>{{ evilPct }}% Зло</span>
          </div>
        </div>
      </div>

      <!-- Win streak callout (when active) -->
      <div
        v-if="winStreak >= 3"
        class="flex items-center gap-3 rounded-xl
          px-5 py-3"
        style="background: linear-gradient(90deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.02) 100%); border: 1px solid rgba(16, 185, 129, 0.15)"
      >
        <i
          class="pi pi-bolt text-lg text-alive"
        />
        <p class="text-sm">
          <span class="font-semibold text-alive">
            {{ winStreak }} перемог поспіль!
          </span>
          <span class="text-text-muted">
            Серія не перервана
          </span>
        </p>
      </div>

      <!-- Most played roles -->
      <PlayerRoleChart :roles="rolePlayCounts" />

      <hr class="border-white/[0.06]" />

      <!-- Game history -->
      <PlayerGameHistory :games="gameHistory" />
    </div>
  </div>
</template>
