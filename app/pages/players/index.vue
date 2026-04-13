<script setup lang="ts">
import { usePlayersWithStats } from '~/composables/usePlayers'
import PlayerListDesktopRow
  from '~/components/players/PlayerListDesktopRow.vue'
import PlayerListMobileRow
  from '~/components/players/PlayerListMobileRow.vue'
import PlayerRecentGames
  from '~/components/players/PlayerRecentGames.vue'

const { players, status } = usePlayersWithStats()

const search = ref('')
const expandedId = ref<string | null>(null)

type SortKey = 'points' | 'gamesPlayed' | 'winRate'
  | 'mvpCount' | 'goodGames' | 'evilGames'
const sortKey = ref<SortKey>('points')
const sortAsc = ref(false)

const sortColumns: {
  key: SortKey | null
  label?: string
  icon?: string
}[] = [
  { key: 'points', label: 'Бали' },
  { key: 'gamesPlayed', label: 'Ігри' },
  { key: 'winRate', label: 'Win%' },
  { key: null, label: 'W / L' },
  { key: 'mvpCount', label: 'MVP' },
  { key: 'goodGames', icon: 'pi-sun' },
  { key: 'evilGames', icon: 'pi-moon' },
]

function toggleSort(key: SortKey) {
  if (sortKey.value === key) {
    sortAsc.value = !sortAsc.value
  }
  else {
    sortKey.value = key
    sortAsc.value = false
  }
}

const filteredPlayers = computed(() => {
  if (!players.value) return []
  let list = [...players.value]
  const q = search.value.toLowerCase().trim()
  if (q) {
    list = list.filter(p =>
      p.nickname.toLowerCase().includes(q),
    )
  }
  const dir = sortAsc.value ? 1 : -1
  const key = sortKey.value
  list.sort((a, b) =>
    dir * (a[key] - b[key])
    || a.nickname.localeCompare(b.nickname),
  )
  return list
})

const podiumMap = computed(() => {
  const map = new Map<string, 'gold' | 'silver' | 'bronze'>()
  if (!players.value || players.value.length < 3) return map
  const ranks = ['gold', 'silver', 'bronze'] as const
  for (let i = 0; i < 3; i++) {
    map.set(players.value[i]!.id, ranks[i]!)
  }
  return map
})

function toggleExpand(playerId: string) {
  expandedId.value = expandedId.value === playerId
    ? null
    : playerId
}
</script>

<template>
  <div>
    <!-- Title + search -->
    <div
      class="mb-6 flex flex-col gap-4
        sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <h1 class="font-heading text-3xl font-bold tracking-tight">
          Гравці
        </h1>
      </div>
      <div class="relative">
        <InputText
          v-model="search"
          placeholder="Пошук гравців..."
          class="w-full sm:w-64"
        />
      </div>
    </div>

    <!-- Loading skeletons -->
    <div
      v-if="status === 'pending'"
      class="overflow-hidden"
    >
      <div
        v-for="i in 8"
        :key="i"
        class="flex items-center gap-4 px-4 py-4
          sm:px-6"
        :class="i < 8
          ? 'border-b border-white/[0.04]' : ''"
      >
        <Skeleton
          width="1.5rem"
          height="1rem"
          class="shrink-0"
        />
        <Skeleton
          shape="circle"
          size="2.5rem"
          class="shrink-0"
        />
        <Skeleton
          width="8rem"
          height="1rem"
          class="shrink-0"
        />
        <div class="hidden flex-1 sm:block" />
        <Skeleton
          width="3rem"
          height="1rem"
          class="hidden shrink-0 sm:block"
        />
        <Skeleton
          width="3rem"
          height="1rem"
          class="hidden shrink-0 sm:block"
        />
        <Skeleton
          width="4rem"
          height="1.25rem"
          class="shrink-0"
        />
      </div>
    </div>

    <!-- Player list -->
    <div
      v-else-if="filteredPlayers.length"
      class="relative overflow-hidden"
    >
      <!-- Desktop table header -->
      <div
        class="hidden border-b border-white/[0.08]
          lg:block"
      >
        <div
          class="grid items-center px-6 py-3 text-xs
            font-semibold uppercase tracking-wider
            text-text-muted"
          style="grid-template-columns:
            2.5rem 1fr 4.5rem 4.5rem 4.5rem 6rem
            4.5rem 3.5rem 3.5rem; column-gap: 1rem"
        >
          <span>#</span>
          <span>Гравець</span>
          <template
            v-for="col in sortColumns"
            :key="col.key"
          >
            <button
              v-if="col.key"
              class="flex cursor-pointer items-center
                justify-center gap-1 transition-colors
                hover:text-text-primary"
              :class="sortKey === col.key
                ? 'text-text-primary' : ''"
              @click="toggleSort(col.key)"
            >
              <i
                v-if="col.icon"
                :class="`pi ${col.icon}`"
              />
              <template v-else>
                {{ col.label }}
              </template>
              <i
                v-if="sortKey === col.key"
                class="pi"
                :class="sortAsc
                  ? 'pi-arrow-up' : 'pi-arrow-down'"
              />
            </button>
            <span
              v-else
              class="text-center"
            >
              {{ col.label }}
            </span>
          </template>
        </div>
      </div>

      <!-- Rows -->
      <div class="flex flex-col">
        <template
          v-for="(player, index) in filteredPlayers"
          :key="player.id"
        >
          <PlayerListDesktopRow
            :player="player"
            :index="index"
            :is-expanded="expandedId === player.id"
            :podium-rank="podiumMap.get(player.id) ?? null"
            @toggle="toggleExpand(player.id)"
          />

          <PlayerListMobileRow
            :player="player"
            :index="index"
            :is-expanded="expandedId === player.id"
            :podium-rank="podiumMap.get(player.id) ?? null"
            @toggle="toggleExpand(player.id)"
          />

          <!-- Expandable recent games panel -->
          <Transition
            enter-active-class="transition-all
              duration-200 ease-out"
            leave-active-class="transition-all
              duration-150 ease-in"
            enter-from-class="max-h-0 opacity-0"
            enter-to-class="max-h-96 opacity-100"
            leave-from-class="max-h-96 opacity-100"
            leave-to-class="max-h-0 opacity-0"
          >
            <div
              v-if="expandedId === player.id"
              class="overflow-hidden border-b
                border-white/[0.06]
                bg-white/[0.02]"
            >
              <PlayerRecentGames
                :player-id="player.id"
              />
            </div>
          </Transition>
        </template>
      </div>
    </div>

    <!-- Empty state -->
    <div
      v-else
      class="flex flex-col items-center
        justify-center py-20 text-center"
    >
      <div
        class="mx-auto mb-4 flex size-20 items-center
          justify-center rounded-full
          bg-white/[0.03]"
      >
        <i
          class="pi pi-users text-text-subtle"
        />
      </div>
      <p class="font-heading text-lg font-semibold">
        {{ search
          ? 'Гравців не знайдено'
          : 'Немає гравців' }}
      </p>
      <p class="mt-1 max-w-xs text-sm text-text-muted">
        {{
          search
            ? 'Спробуйте змінити пошуковий запит'
            : 'Гравці з\'являться після створення ігор'
        }}
      </p>
      <Button
        v-if="search"
        label="Очистити пошук"
        severity="secondary"
        text
        class="mt-4"
        icon="pi pi-times"
        @click="search = ''"
      />
    </div>
  </div>
</template>
