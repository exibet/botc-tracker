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
    <div
      v-if="isLoading"
      class="flex flex-col gap-6"
    >
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
            <Skeleton
              width="12rem"
              height="2rem"
            />
            <Skeleton
              width="16rem"
              height="1rem"
            />
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
    <div
      v-else
      class="flex flex-col gap-6"
    >
      <!-- Header -->
      <PlayerHeader
        :player="player"
        :last-game-date="lastGameDate"
        :win-streak="winStreak"
      />

      <!-- Stats section -->
      <div
        class="grid grid-cols-1 gap-3
          lg:grid-cols-2"
      >
        <!-- Left column: numbers -->
        <div class="flex flex-col gap-3">
          <!-- Hero stats: Points, Win Rate, Games -->
          <div class="grid grid-cols-3 gap-3">
            <div
              class="rounded-xl border
                border-white/10
                px-3 py-3 text-center"
            >
              <p
                class="font-heading text-2xl font-bold
                  text-accent sm:text-3xl"
              >
                {{ stats.points }}
              </p>
              <p
                class="mt-0.5 text-[11px]
                  text-text-muted"
              >
                Бали
              </p>
            </div>
            <div
              class="rounded-xl border
                border-white/10
                px-3 py-3 text-center"
            >
              <p
                class="font-heading text-2xl font-bold
                  text-win sm:text-3xl"
              >
                {{ stats.winRate }}<span
                  class="text-base font-semibold"
                >%</span>
              </p>
              <p
                class="mt-0.5 text-[11px]
                  text-text-muted"
              >
                Перемог
              </p>
            </div>
            <div
              class="rounded-xl border
                border-white/10
                px-3 py-3 text-center"
            >
              <p
                class="font-heading text-2xl font-bold
                  text-text sm:text-3xl"
              >
                {{ stats.totalGames }}
              </p>
              <p
                class="mt-0.5 text-[11px]
                  text-text-muted"
              >
                Ігор
              </p>
            </div>
          </div>

          <!-- Secondary: Wins, Losses, MVP, Survival -->
          <div
            class="grid grid-cols-4 gap-2 rounded-xl
              border border-white/10
              px-3 py-3 text-center
              sm:px-4"
          >
            <div>
              <p
                class="flex items-center justify-center
                  gap-1 font-heading text-lg font-bold
                  text-win"
              >
                <i class="pi pi-trophy text-[11px]" />
                {{ stats.wins }}
              </p>
              <p class="text-[11px] text-text-muted">
                Перемог
              </p>
            </div>
            <div>
              <p
                class="font-heading text-lg font-bold
                  text-text-muted"
              >
                {{ stats.losses }}
              </p>
              <p class="text-[11px] text-text-muted">
                Поразок
              </p>
            </div>
            <div>
              <p
                class="flex items-center justify-center
                  gap-1 font-heading text-lg font-bold
                  text-accent"
              >
                <i
                  class="pi pi-star-fill text-[11px]"
                />
                {{ stats.mvpCount }}
              </p>
              <p class="text-[11px] text-text-muted">
                MVP
              </p>
            </div>
            <div>
              <p
                class="font-heading text-lg font-bold
                  text-text"
              >
                {{ stats.survivalRate }}<span
                  class="text-xs font-semibold
                    text-text-muted"
                >%</span>
              </p>
              <p class="text-[11px] text-text-muted">
                Виживання
              </p>
            </div>
          </div>
        </div>

        <!-- Right column: alignment breakdown -->
        <div
          class="flex flex-col justify-between
            rounded-xl border border-white/10
            px-4 py-3 sm:px-5"
        >
          <div class="grid grid-cols-2 gap-4">
            <!-- Good side -->
            <div class="flex flex-col gap-2">
              <span
                class="hidden items-center gap-1.5
                  text-xs font-semibold uppercase justify-center
                  tracking-wide text-good sm:flex"
              >
                <i class="pi pi-sun text-[10px]" />
                Добро
              </span>
              <p
                class="font-heading text-2xl
                  font-bold leading-none text-good"
              >
                {{ stats.goodGames }}
                <span
                  class="text-xs font-medium
                  text-good/60"
                >ігор</span>
              </p>
              <div class="flex flex-col gap-1">
                <div
                  class="flex items-center
                    justify-between text-[11px]"
                >
                  <span class="text-text-muted">
                    Вінрейт
                  </span>
                  <span
                    class="font-semibold text-good"
                  >{{ stats.goodWinRate }}%</span>
                </div>
                <div
                  class="h-1.5 overflow-hidden
                    rounded-full bg-white/[0.06]"
                >
                  <div
                    class="h-full rounded-full
                      bg-good transition-all
                      duration-500"
                    :style="{
                      width: `${stats.goodWinRate}%`,
                    }"
                  />
                </div>
              </div>
            </div>

            <!-- Evil side -->
            <div class="flex flex-col gap-2">
              <span
                class="hidden items-center gap-1.5
                  text-xs font-semibold uppercase justify-center
                  tracking-wide text-evil sm:flex"
              >
                <i class="pi pi-moon text-[10px]" />
                Зло
              </span>
              <p
                class="font-heading text-2xl
                  font-bold leading-none text-evil"
              >
                {{ stats.evilGames }}
                <span
                  class="text-xs font-medium
                  text-evil/60"
                >ігор</span>
              </p>
              <div class="flex flex-col gap-1">
                <div
                  class="flex items-center
                    justify-between text-[11px]"
                >
                  <span class="text-text-muted">
                    Вінрейт
                  </span>
                  <span
                    class="font-semibold text-evil"
                  >{{ stats.evilWinRate }}%</span>
                </div>
                <div
                  class="h-1.5 overflow-hidden
                    rounded-full bg-white/[0.06]"
                >
                  <div
                    class="h-full rounded-full
                      bg-evil transition-all
                      duration-500"
                    :style="{
                      width: `${stats.evilWinRate}%`,
                    }"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Good/Evil ratio bar -->
          <div
            v-if="stats.totalGames > 0"
            class="mt-6"
          >
            <div
              class="flex h-1.5 overflow-hidden
                rounded-full bg-white/[0.06]"
            >
              <div
                class="rounded-l-full bg-good
                  transition-all duration-500"
                :style="{ width: `${goodPct}%` }"
              />
              <div
                class="rounded-r-full bg-evil
                  transition-all duration-500"
                :style="{ width: `${evilPct}%` }"
              />
            </div>
            <div
              class="mt-1 flex justify-between
                text-[10px] text-text-subtle"
            >
              <span>{{ goodPct }}% Добро</span>
              <span>{{ evilPct }}% Зло</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Most played roles -->
      <PlayerRoleChart :roles="rolePlayCounts" />

      <hr class="border-white/[0.06]">

      <!-- Game history -->
      <PlayerGameHistory :games="gameHistory" />
    </div>
  </div>
</template>
