<script setup lang="ts">
import GamePlayersPanel
  from '~/components/games/GamePlayersPanel.vue'
import GameCard
  from '~/components/games/GameCard.vue'
import PlayerListDesktopRow
  from '~/components/players/PlayerListDesktopRow.vue'
import PlayerListMobileRow
  from '~/components/players/PlayerListMobileRow.vue'
import { podiumRank } from '~/utils/stats'
import { formatDateWithWeekday } from '~/utils/date'

const { data, status, refresh: refreshHome } = useHome()

const expandedGameId = ref<string | null>(null)

watch(() => data.value?.inProgressGames, (games) => {
  if (games?.length && !expandedGameId.value) {
    expandedGameId.value = games[0]!.id
  }
}, { immediate: true })

function toggleGame(gameId: string) {
  expandedGameId.value
    = expandedGameId.value === gameId ? null : gameId
}

function isExpanded(gameId: string) {
  return expandedGameId.value === gameId
}

const goodPct = computed(() => {
  if (!data.value?.totalGames) return 0
  return Math.round(
    (data.value.goodWins / data.value.totalGames) * 100,
  )
})
const evilPct = computed(() => {
  if (!data.value?.totalGames) return 0
  return 100 - goodPct.value
})

const recentFinished = computed(() => {
  const games = data.value?.recentGames
  if (!games?.length) return []
  return games
    .filter(g => g.status === 'finished')
    .slice(0, 4)
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

    <template v-else-if="data?.totalGames">
      <!-- Quick Stats -->
      <section
        class="mt-6 grid grid-cols-2 gap-3
          sm:grid-cols-4 sm:gap-4"
      >
        <StatCard
          :value="data.goodWins"
          label="Добро"
          icon="pi pi-sun"
          color="good"
          class="order-3 sm:order-none"
        />
        <StatCard
          :value="data.totalGames"
          label="Ігор"
          icon="pi pi-flag"
          to="/games"
          class="order-2 sm:order-none"
        />
        <StatCard
          :value="data.totalPlayers"
          label="Гравців"
          icon="pi pi-users"
          to="/players"
          class="order-1 sm:order-none"
        />
        <StatCard
          :value="data.evilWins"
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
        <div class="space-y-4">
          <template
            v-for="(game, index)
              in data.inProgressGames"
            :key="game.id"
          >
            <p
              v-if="index === 0
                || game.date
                  !== data.inProgressGames[index - 1]!.date"
              class="text-right text-xs font-medium
                uppercase tracking-wide
                text-text-subtle"
              :class="{ 'pt-2': index !== 0 }"
            >
              {{ formatDateWithWeekday(game.date) }}
            </p>
            <div
              class="cursor-pointer
                [&_a]:pointer-events-none"
              @click="toggleGame(game.id)"
            >
              <GameCard
                :game="game"
                :class="isExpanded(game.id)
                  ? '!rounded-b-none !border-b-0'
                  : ''"
              />
            </div>
            <Transition
              enter-active-class="transition-all
                duration-200 ease-out"
              leave-active-class="transition-all
                duration-150 ease-in"
              enter-from-class="max-h-0 opacity-0"
              enter-to-class="max-h-[32rem]
                opacity-100"
              leave-from-class="max-h-[32rem]
                opacity-100"
              leave-to-class="max-h-0 opacity-0"
            >
              <div
                v-if="isExpanded(game.id)"
                class="overflow-hidden rounded-b-xl
                  border border-t-0
                  border-white/[0.06]"
              >
                <GamePlayersPanel
                  :game-id="game.id"
                  :winner="game.winner"
                  :game-status="game.status"
                  @mvp-changed="refreshHome"
                />
              </div>
            </Transition>
          </template>
        </div>
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
              <i class="pi pi-sun text-[10px]" />
            </span>
            <span class="text-center">
              <i class="pi pi-moon text-[10px]" />
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
        <div class="space-y-4">
          <template
            v-for="(game, index)
              in data.upcomingGames"
            :key="game.id"
          >
            <p
              v-if="index === 0
                || game.date
                  !== data.upcomingGames[index - 1]!.date"
              class="text-right text-xs font-medium
                uppercase tracking-wide
                text-text-subtle"
              :class="{ 'pt-2': index !== 0 }"
            >
              {{ formatDateWithWeekday(game.date) }}
            </p>
            <div
              class="cursor-pointer
                [&_a]:pointer-events-none"
              @click="toggleGame(game.id)"
            >
              <GameCard
                :game="game"
                :class="isExpanded(game.id)
                  ? '!rounded-b-none !border-b-0'
                  : ''"
              />
            </div>
            <Transition
              enter-active-class="transition-all
                duration-200 ease-out"
              leave-active-class="transition-all
                duration-150 ease-in"
              enter-from-class="max-h-0 opacity-0"
              enter-to-class="max-h-[32rem]
                opacity-100"
              leave-from-class="max-h-[32rem]
                opacity-100"
              leave-to-class="max-h-0 opacity-0"
            >
              <div
                v-if="isExpanded(game.id)"
                class="overflow-hidden rounded-b-xl
                  border border-t-0
                  border-white/[0.06]"
              >
                <GamePlayersPanel
                  :game-id="game.id"
                  :winner="game.winner"
                  :game-status="game.status"
                  @mvp-changed="refreshHome"
                />
              </div>
            </Transition>
          </template>
        </div>
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
          class="pi pi-inbox text-4xl text-text-subtle"
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
