<script setup lang="ts">
import type { GameWithDetails } from '~/types'
import GameCard from '~/components/games/GameCard.vue'

const { games, status } = useGames()
const { isAdmin } = useAuth()

interface MonthGroup {
  key: string
  label: string
  games: GameWithDetails[]
}

const groupedGames = computed<MonthGroup[]>(() => {
  if (!games.value?.length) return []

  const groups = new Map<string, MonthGroup>()

  for (const game of games.value) {
    const key = game.date
    const d = new Date(game.date)
    const label = d.toLocaleDateString('uk-UA', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    })

    if (!groups.has(key)) {
      groups.set(key, {
        key,
        label: label.charAt(0).toUpperCase() + label.slice(1),
        games: [],
      })
    }
    groups.get(key)!.games.push(game as GameWithDetails)
  }

  return Array.from(groups.values())
})

const stats = computed(() => {
  if (!games.value?.length) {
    return { total: 0, goodWins: 0, evilWins: 0 }
  }
  const total = games.value.length
  const goodWins = games.value.filter(
    g => g.winner === 'good',
  ).length
  const evilWins = total - goodWins
  return { total, goodWins, evilWins }
})

const goodPct = computed(() =>
  stats.value.total
    ? Math.round((stats.value.goodWins / stats.value.total) * 100)
    : 0,
)
const evilPct = computed(() =>
  stats.value.total ? 100 - goodPct.value : 0,
)
</script>

<template>
  <div>
    <!-- Header -->
    <div
      class="flex gap-4 justify-between sm:items-center"
    >
      <h1
        class="font-heading text-3xl font-bold
          tracking-tight sm:text-4xl"
      >
        Ігри
      </h1>
      <NuxtLink
        v-if="isAdmin"
        to="/games/new"
      >
        <Button
          label="Створити гру"
          icon="pi pi-plus"
          severity="contrast"
          data-testid="create-game-btn"
        />
      </NuxtLink>
    </div>

    <!-- Loading -->
    <div
      v-if="status === 'pending'"
      class="mt-8 space-y-4"
    >
      <Skeleton
        height="5rem"
        class="!rounded-xl"
      />
      <Skeleton
        v-for="i in 4"
        :key="i"
        height="7rem"
        class="!rounded-xl"
      />
    </div>

    <template v-else-if="games?.length">
      <!-- Stats banner -->
      <div
        class="mt-8 rounded-xl border border-white/[0.06]
          bg-white/[0.02] p-5 sm:p-6"
      >
        <div
          class="grid grid-cols-3 gap-4
            text-center sm:gap-8"
        >
          <div>
            <p
              class="font-heading text-2xl font-bold
                text-text sm:text-3xl"
            >
              {{ stats.total }}
            </p>
            <p class="mt-1 text-sm text-text-muted">
              Всього ігор
            </p>
          </div>
          <div>
            <p
              class="font-heading text-2xl font-bold
                text-good sm:text-3xl"
            >
              {{ stats.goodWins }}
            </p>
            <p class="mt-1 text-sm text-text-muted">
              <i class="pi pi-sun mr-1 text-xs text-good" />
              Добро
            </p>
          </div>
          <div>
            <p
              class="font-heading text-2xl font-bold
                text-evil sm:text-3xl"
            >
              {{ stats.evilWins }}
            </p>
            <p class="mt-1 text-sm text-text-muted">
              <i class="pi pi-moon mr-1 text-xs text-evil" />
              Зло
            </p>
          </div>
        </div>

        <!-- Win ratio bar -->
        <div class="mt-4">
          <div
            class="flex h-2.5 overflow-hidden rounded-full
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
            class="mt-1.5 flex justify-between text-xs
              text-text-subtle"
          >
            <span>{{ goodPct }}% Добро</span>
            <span>{{ evilPct }}% Зло</span>
          </div>
        </div>
      </div>

      <!-- Grouped games -->
      <div class="mt-8 space-y-10">
        <section
          v-for="group in groupedGames"
          :key="group.key"
        >
          <!-- Month header -->
          <div
            class="mb-4 flex items-center gap-3
              border-b border-white/[0.08] pb-3"
          >
            <h2
              class="font-heading text-lg font-semibold
                tracking-wide text-accent sm:text-xl"
            >
              {{ group.label }}
            </h2>
            <span class="text-sm text-text-subtle">
              {{ group.games.length }}
              {{ group.games.length === 1 ? 'гра' : 'ігор' }}
            </span>
          </div>

          <!-- Game cards grid -->
          <div
            class="grid gap-4
              lg:grid-cols-2"
          >
            <GameCard
              v-for="game in group.games"
              :key="game.id"
              :game="game"
            />
          </div>
        </section>
      </div>
    </template>

    <!-- Empty state -->
    <div
      v-else
      class="mt-16 flex flex-col items-center
        text-center text-text-muted"
    >
      <i
        class="pi pi-inbox mb-4 text-5xl
          text-text-subtle"
      />
      <p class="font-heading text-xl">
        Ще немає ігор
      </p>
      <p class="mt-1 text-sm">
        Створіть першу гру, щоб почати відстежувати
      </p>
    </div>
  </div>
</template>
