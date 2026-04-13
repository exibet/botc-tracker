<script setup lang="ts">
import GameCard
  from '~/components/games/GameCard.vue'
import ExpandableGameList
  from '~/components/home/ExpandableGameList.vue'
import PlayerListDesktopRow
  from '~/components/players/PlayerListDesktopRow.vue'
import PlayerListMobileRow
  from '~/components/players/PlayerListMobileRow.vue'
import { podiumRank } from '~/utils/stats'

const { data, status } = useHome()
const { stats, goodPct, evilPct } = useGameStats()

const defaultExpandedId = computed(
  () => data.value?.inProgressGames?.[0]?.id ?? null,
)
const manualExpandedId = ref<string | undefined>()

const expandedGameId = computed(
  () => manualExpandedId.value !== undefined
    ? manualExpandedId.value || null
    : defaultExpandedId.value,
)

function toggleGame(gameId: string) {
  manualExpandedId.value
    = expandedGameId.value === gameId ? '' : gameId
}

function onPlayerCountChanged(gameId: string, count: number) {
  if (!data.value) return
  const updateList = (list: typeof data.value.inProgressGames) =>
    list.map(g => g.id === gameId
      ? { ...g, player_count: count || null }
      : g,
    )
  data.value = {
    ...data.value,
    inProgressGames: updateList(data.value.inProgressGames),
    upcomingGames: updateList(data.value.upcomingGames),
  }
}

const recentFinished = computed(() => {
  const games = data.value?.recentGames
  if (!games?.length) return []
  return games
    .filter(g => g.status === 'finished')
})
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="pb-2 text-center sm:pt-10">
      <h1
        class="font-heading text-3xl font-bold
          tracking-tight text-text sm:text-4xl"
      >
        <span class="text-primary text-4xl sm:text-5xl">⛧</span>
        <span class="text-accent mx-3">Хроніки</span>
        <br class="sm:hidden">Годинникової Вежі
      </h1>
      <p
        class="mt-2 text-sm text-text-muted sm:text-base"
      >
        Blood on the Clocktower — трекер ігор ком'юніті
      </p>
    </section>

    <!-- Loading state -->
    <div
      v-if="status === 'pending' && !data"
      class="mt-6 space-y-4"
    >
      <div
        class="grid grid-cols-2 gap-3 sm:grid-cols-4"
      >
        <Skeleton
          v-for="i in 4"
          :key="i"
          height="5rem"
          class="!rounded-xl"
        />
      </div>
      <Skeleton
        height="2.5rem"
        class="!rounded-full"
      />
      <Skeleton
        height="10rem"
        class="!rounded-xl"
      />
      <Skeleton
        height="16rem"
        class="!rounded-xl"
      />
    </div>

    <template v-else-if="stats?.totalGames || data?.topPlayers?.length">
      <!-- Quick Stats -->
      <section
        v-if="stats?.totalGames"
        class="mt-6 grid grid-cols-2 gap-3
          sm:grid-cols-4 sm:gap-4"
      >
        <StatCard
          :value="stats.goodWins"
          label="Добро"
          icon="pi pi-sun"
          color="good"
          class="order-3 sm:order-none"
        />
        <StatCard
          :value="stats.totalGames"
          label="Ігор"
          icon="pi pi-flag"
          to="/games"
          class="order-2 sm:order-none"
        />
        <StatCard
          :value="stats.totalPlayers"
          label="Гравців"
          icon="pi pi-users"
          to="/players"
          class="order-1 sm:order-none"
        />
        <StatCard
          :value="stats.evilWins"
          label="Зло"
          icon="pi pi-moon"
          color="evil"
          class="order-4 sm:order-none"
        />
      </section>

      <!-- Good vs Evil ratio bar -->
      <section class="mt-4">
        <GoodEvilBar
          :good-pct="goodPct"
          :evil-pct="evilPct"
        />
      </section>

      <!-- Games in progress -->
      <section
        v-if="data.inProgressGames?.length"
        class="mt-8"
      >
        <h2
          class="mb-3 flex items-baseline gap-2
            font-heading text-lg font-semibold
            tracking-wide text-accent"
        >
          Ігри в процесі
        </h2>
        <ExpandableGameList
          :games="data.inProgressGames"
          :expanded-game-id="expandedGameId"
          @toggle="toggleGame"
          @player-count-changed="onPlayerCountChanged"
        />
      </section>

      <!-- Top Players -->
      <section
        v-if="data.topPlayers?.length"
        class="mt-8"
      >
        <div
          class="mb-3 flex items-center
            justify-between"
        >
          <h2
            class="font-heading text-lg font-semibold
              tracking-wide text-accent"
          >
            Топ гравці
          </h2>
          <NuxtLink
            to="/players"
            class="text-xs text-text-muted
              transition-colors hover:text-text"
          >
            Всі гравці
            <i
              class="pi pi-chevron-right
                ml-0.5 text-[10px]"
            />
          </NuxtLink>
        </div>

        <!-- Desktop header -->
        <div
          class="hidden border-b border-white/[0.08]
            lg:block"
        >
          <div
            class="grid items-center px-6 py-3
              text-xs font-semibold uppercase
              tracking-wider text-text-muted"
            style="grid-template-columns:
              2.5rem 1fr 4.5rem 4.5rem 4.5rem
              6rem 4.5rem 3.5rem 3.5rem;
              column-gap: 1rem"
          >
            <span>#</span>
            <span>Гравець</span>
            <span class="text-center">Бали</span>
            <span class="text-center">Ігри</span>
            <span class="text-center">Win%</span>
            <span class="text-center">W / L</span>
            <span class="text-center">MVP</span>
            <span class="text-center">
              <i class="pi pi-sun" />
            </span>
            <span class="text-center">
              <i class="pi pi-moon" />
            </span>
          </div>
        </div>

        <!-- Rows -->
        <div class="flex flex-col">
          <template
            v-for="(player, idx)
              in data.topPlayers"
            :key="player.id"
          >
            <PlayerListDesktopRow
              :player="player"
              :index="idx"
              :is-expanded="false"
              :podium-rank="podiumRank(
                idx, 3, data.topPlayers.length,
              )"
            />
            <PlayerListMobileRow
              :player="player"
              :index="idx"
              :is-expanded="false"
              :podium-rank="podiumRank(
                idx, 3, data.topPlayers.length,
              )"
            />
          </template>
        </div>
      </section>

      <!-- Upcoming Games -->
      <section
        v-if="data.upcomingGames?.length"
        class="mt-8"
      >
        <h2
          class="mb-3 font-heading text-lg
            font-semibold tracking-wide text-accent"
        >
          Заплановані ігри
        </h2>
        <ExpandableGameList
          :games="data.upcomingGames"
          :expanded-game-id="expandedGameId"
          @toggle="toggleGame"
          @player-count-changed="onPlayerCountChanged"
        />
      </section>

      <!-- Recent Games -->
      <section
        v-if="recentFinished.length"
        class="mt-8"
      >
        <div
          class="mb-3 flex items-center
            justify-between"
        >
          <h2
            class="font-heading text-lg font-semibold
              tracking-wide text-accent"
          >
            Останні ігри
          </h2>
          <NuxtLink
            to="/games"
            class="text-xs text-text-muted
              transition-colors hover:text-text"
          >
            Всі ігри
            <i
              class="pi pi-chevron-right
                ml-0.5 text-[10px]"
            />
          </NuxtLink>
        </div>

        <div class="grid gap-4 lg:grid-cols-2">
          <GameCard
            v-for="game in recentFinished"
            :key="game.id"
            :game="game"
          />
        </div>
      </section>
    </template>

    <!-- Empty state (no games yet) -->
    <div
      v-else-if="!data"
      class="mt-16 flex flex-col items-center
        text-center text-text-muted"
    >
      <div
        class="mx-auto mb-4 flex size-20
          items-center justify-center rounded-full
          bg-white/[0.03]"
      >
        <i
          class="pi pi-inbox text-text-subtle"
        />
      </div>
      <p class="font-heading text-xl font-semibold">
        Ще немає ігор
      </p>
      <p class="mt-1 max-w-xs text-sm">
        Створіть першу гру, щоб побачити статистику
      </p>
      <div class="mt-6 flex gap-3">
        <NuxtLink to="/games">
          <Button
            label="Ігри"
            icon="pi pi-flag"
            severity="contrast"
          />
        </NuxtLink>
        <NuxtLink to="/roles">
          <Button
            label="Каталог ролей"
            icon="pi pi-book"
            severity="secondary"
            outlined
          />
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
