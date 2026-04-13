<script setup lang="ts">
import { usePlayerStats } from '~/composables/usePlayerStats'
import PlayerHeader
  from '~/components/players/PlayerHeader.vue'
import PlayerRoleChart
  from '~/components/players/PlayerRoleChart.vue'
import PlayerGameHistory
  from '~/components/players/PlayerGameHistory.vue'
import LinkProfileDialog
  from '~/components/players/LinkProfileDialog.vue'
import UnlinkProfileDialog
  from '~/components/players/UnlinkProfileDialog.vue'
import HeroStat
  from '~/components/players/HeroStat.vue'
import PlayerAlignmentSide
  from '~/components/players/PlayerAlignmentSide.vue'

const route = useRoute()
const playerId = route.params.id as string
const { isAdmin } = useAuth()

const showLinkDialog = ref(false)
const showUnlinkDialog = ref(false)

function onLinked(authId: string) {
  navigateTo(`/players/${authId}`)
}

function onUnlinked(manualId: string) {
  navigateTo(`/players/${manualId}`)
}

const {
  player,
  stats,
  gameHistory,
  rolePlayCounts,
  winStreak,
  status,
} = usePlayerStats(playerId)

const isLoading = computed(
  () => status.value === 'pending',
)

const lastGameDate = computed(() =>
  gameHistory.value.length > 0
    ? gameHistory.value[0]!.date
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
    <!-- Back link + admin actions -->
    <div
      class="mb-6 flex items-center justify-between"
    >
      <NuxtLink
        to="/players"
        class="inline-flex items-center gap-1.5
          text-sm text-text-muted transition-colors
          hover:text-text"
      >
        <i class="pi pi-arrow-left" />
        Гравці
      </NuxtLink>

      <div
        v-if="isAdmin && player"
        class="flex items-center gap-2"
      >
        <Button
          v-if="player.is_manual"
          icon="pi pi-link"
          label="Зв'язати"
          severity="secondary"
          text
          size="small"
          @click="showLinkDialog = true"
        />
        <Button
          v-else
          icon="pi pi-replay"
          label="Від'єднати"
          severity="secondary"
          text
          size="small"
          @click="showUnlinkDialog = true"
        />
      </div>
    </div>

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
      v-else-if="status === 'error' || !player"
      class="flex flex-col items-center
        justify-center py-20 text-center"
    >
      <div
        class="mx-auto mb-4 flex size-20 items-center
          justify-center rounded-full
          bg-white/[0.03]"
      >
        <i
          class="pi pi-user text-text-subtle"
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

      <LinkProfileDialog
        v-if="player.is_manual"
        v-model:visible="showLinkDialog"
        :manual-profile="player"
        @linked="onLinked"
      />

      <UnlinkProfileDialog
        v-if="!player.is_manual"
        v-model:visible="showUnlinkDialog"
        :profile="player"
        @unlinked="onUnlinked"
      />

      <!-- Stats section -->
      <div
        class="grid grid-cols-1 gap-3
          lg:grid-cols-2"
      >
        <!-- Left column: numbers -->
        <div class="flex flex-col gap-3">
          <!-- Hero stats: Points, Win Rate, MVP -->
          <div class="grid grid-cols-3 gap-3">
            <HeroStat
              label="Бали"
              color-class="text-accent"
            >
              {{ stats.points }}
            </HeroStat>
            <HeroStat
              label="Перемог"
              color-class="text-win"
            >
              {{ stats.winRate }}<span
                class="text-base font-semibold"
              >%</span>
            </HeroStat>
            <HeroStat
              label="MVP"
              color-class="text-accent"
            >
              <i class="pi pi-star-fill" />
              {{ stats.mvpCount }}
            </HeroStat>
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
                class="font-heading text-lg font-bold
                  text-text"
              >
                {{ stats.totalGames }}
              </p>
              <p class="text-[11px] text-text-muted">
                Ігор
              </p>
            </div>
            <div>
              <p
                class="flex items-center justify-center
                  gap-1 font-heading text-lg font-bold
                  text-win"
              >
                <i class="pi pi-trophy" />
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
            <PlayerAlignmentSide
              label="Добро"
              icon="pi pi-sun"
              color="good"
              :games="stats.goodGames"
              :win-rate="stats.goodWinRate"
            />
            <PlayerAlignmentSide
              label="Зло"
              icon="pi pi-moon"
              color="evil"
              :games="stats.evilGames"
              :win-rate="stats.evilWinRate"
            />
          </div>

          <!-- Good/Evil ratio bar -->
          <GoodEvilBar
            v-if="stats.totalGames > 0"
            :good-pct="goodPct"
            :evil-pct="evilPct"
            height="h-1.5"
            class="mt-6"
          />
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
