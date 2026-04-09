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

const { data, status, refresh: refreshHome } = useHome()
const featuredExpanded = ref(true)

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

const featuredGame = computed(
  () => data.value?.recentGames?.[0] ?? null,
)

const olderGames = computed(
  () => data.value?.recentGames?.slice(1, 5) ?? [],
)

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  const formatted = d.toLocaleDateString('uk-UA', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
  return formatted.charAt(0).toUpperCase()
    + formatted.slice(1)
}
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="pb-2 pt-6 text-center sm:pt-10">
      <h1
        class="font-heading text-3xl font-bold
          tracking-tight text-text sm:text-4xl"
      >
        <span class="text-primary">&#x2720;</span>
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
        />
        <StatCard
          :value="data.totalGames"
          label="Ігор"
          icon="pi pi-flag"
          to="/games"
        />
        <StatCard
          :value="data.totalPlayers"
          label="Гравців"
          icon="pi pi-users"
          to="/players"
        />
        <StatCard
          :value="data.evilWins"
          label="Зло"
          icon="pi pi-moon"
          color="evil"
        />
      </section>

      <!-- Good vs Evil ratio bar -->
      <section class="mt-4">
        <GoodEvilBar
          :good-pct="goodPct"
          :evil-pct="evilPct"
        />
      </section>

      <!-- Last Game (expandable) -->
      <section
        v-if="featuredGame"
        class="mt-8"
      >
        <h2
          class="mb-3 flex items-baseline gap-2
            font-heading text-lg font-semibold
            tracking-wide text-accent"
        >
          Остання гра
          <span
            class="text-sm font-normal
              text-text-muted"
          >
            {{ formatDate(featuredGame.date) }}
          </span>
        </h2>
        <div
          class="cursor-pointer
            [&_a]:pointer-events-none"
          @click="
            featuredExpanded = !featuredExpanded
          "
        >
          <GameCard
            :game="featuredGame"
            :class="featuredExpanded
              ? '!rounded-b-none !border-b-0'
              : ''"
          />
        </div>

        <!-- Expanded players panel -->
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
            v-if="featuredExpanded"
            class="overflow-hidden rounded-b-xl
              border border-t-0
              border-white/[0.06]"
          >
            <GamePlayersPanel
              :game-id="featuredGame.id"
              :winner="featuredGame.winner"
              @mvp-changed="refreshHome"
            />
          </div>
        </Transition>
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

      <!-- Recent Games -->
      <section
        v-if="olderGames.length"
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
            v-for="game in olderGames"
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
