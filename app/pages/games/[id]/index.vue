<script setup lang="ts">
import GamePlayersTable
  from '~/components/games/GamePlayersTable.vue'
import {
  getScriptLabel,
  getWinnerInfo,
} from '~/composables/useGameLabels'

const route = useRoute()
const gameId = route.params.id as string

const { getById } = useGames()
const { players, status: playersStatus } = useGamePlayers(gameId)
const { isAdmin } = useAuth()

const { data: game, status: gameStatus } = useAsyncData(
  `game-${gameId}`,
  () => getById(gameId),
)

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('uk-UA', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
</script>

<template>
  <div>
    <div
      v-if="gameStatus === 'pending'"
      class="space-y-4"
    >
      <Skeleton
        height="2rem"
        width="60%"
      />
      <Skeleton
        height="1.5rem"
        width="40%"
      />
      <Skeleton height="20rem" />
    </div>

    <div
      v-else-if="!game"
      class="text-center text-text-muted"
    >
      <i class="pi pi-exclamation-circle mb-2 text-4xl" />
      <p>Гру не знайдено</p>
      <NuxtLink
        to="/games"
        class="mt-4 inline-block text-primary"
      >
        Повернутися до списку ігор
      </NuxtLink>
    </div>

    <template v-else>
      <div class="mb-6">
        <div class="flex items-start justify-between gap-4">
          <div>
            <NuxtLink
              to="/games"
              class="mb-2 inline-flex items-center gap-1
                text-sm text-text-muted
                hover:text-text"
            >
              <i class="pi pi-arrow-left text-xs" />
              Ігри
            </NuxtLink>
            <h1 class="font-heading text-2xl font-bold">
              {{ formatDate(game.date) }}
            </h1>
          </div>
          <NuxtLink
            v-if="isAdmin"
            :to="`/games/${game.id}/edit`"
          >
            <Button
              label="Редагувати"
              icon="pi pi-pencil"
              severity="secondary"
              text
              size="small"
            />
          </NuxtLink>
        </div>

        <div class="mt-3 flex flex-wrap items-center gap-2">
          <Tag
            :value="getScriptLabel(game.script)"
            severity="secondary"
            rounded
          />
          <Tag
            v-if="game.script === 'custom'
              && game.custom_script_name"
            :value="game.custom_script_name"
            severity="secondary"
            rounded
          />
          <Tag
            :value="getWinnerInfo(game.winner)?.labelUa
              ?? game.winner"
            :severity="getWinnerInfo(game.winner)?.severity
              ?? 'secondary'"
            rounded
          />
          <span
            v-if="game.player_count"
            class="flex items-center gap-1
              text-sm text-text-muted"
          >
            <i class="pi pi-users text-xs" />
            {{ game.player_count }} гравців
          </span>
          <span
            v-if="game.storyteller"
            class="flex items-center gap-1
              text-sm text-text-muted"
          >
            <i class="pi pi-book text-xs" />
            {{ game.storyteller.nickname }}
          </span>
        </div>

        <p
          v-if="game.notes"
          class="mt-3 text-sm text-text-muted"
        >
          {{ game.notes }}
        </p>
      </div>

      <h2
        class="mb-3 font-heading text-lg font-semibold"
      >
        Гравці
      </h2>

      <div v-if="playersStatus === 'pending'">
        <Skeleton height="15rem" />
      </div>
      <GamePlayersTable
        v-else-if="players"
        :players="players"
      />
    </template>
  </div>
</template>
