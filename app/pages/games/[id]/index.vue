<script setup lang="ts">
import GamePlayersPanel
  from '~/components/games/GamePlayersPanel.vue'
import PlayerAvatar
  from '~/components/players/PlayerAvatar.vue'
import {
  getScriptLabel,
  getWinnerInfo,
} from '~/composables/useGameLabels'

const route = useRoute()
const gameId = route.params.id as string

const { getById } = useGames()
const { isAdmin } = useAuth()

const { data: game, status: gameStatus, refresh: refreshGame } = useAsyncData(
  `game-${gameId}`,
  () => getById(gameId),
)

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('uk-UA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const winnerInfo = computed(() =>
  game.value ? getWinnerInfo(game.value.winner) : null,
)

const mvpPlayer = computed(
  () => game.value?.mvp_player ?? null,
)

const panelRef = ref<InstanceType<
  typeof GamePlayersPanel
> | null>(null)

watch(
  () => panelRef.value?.players,
  (p) => {
    if (game.value && p) {
      game.value.player_count = p.length || null
    }
  },
)
</script>

<template>
  <div>
    <!-- Loading -->
    <div
      v-if="gameStatus === 'pending' && !game"
      class="space-y-6"
    >
      <Skeleton
        height="2.5rem"
        width="50%"
        class="!rounded-lg"
      />
      <Skeleton
        height="6rem"
        class="!rounded-xl"
      />
      <Skeleton
        height="20rem"
        class="!rounded-xl"
      />
    </div>

    <!-- Not found -->
    <div
      v-else-if="gameStatus !== 'pending' && !game"
      class="flex flex-col items-center py-16
        text-center text-text-muted"
    >
      <i
        class="pi pi-exclamation-circle mb-4
          text-5xl text-text-subtle"
      />
      <p class="font-heading text-xl">
        Гру не знайдено
      </p>
      <NuxtLink
        to="/games"
        class="mt-4 inline-flex items-center gap-1.5
          text-primary transition-colors
          hover:text-primary-hover"
      >
        <i class="pi pi-arrow-left text-sm" />
        Повернутися до списку ігор
      </NuxtLink>
    </div>

    <template v-else>
      <!-- Back link + Edit -->
      <div
        class="mb-6 flex items-center justify-between"
      >
        <NuxtLink
          to="/games"
          class="inline-flex items-center gap-1.5
            text-sm text-text-muted transition-colors
            hover:text-text"
        >
          <i class="pi pi-arrow-left text-xs" />
          Ігри
        </NuxtLink>
        <ClientOnly>
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
        </ClientOnly>
      </div>

      <!-- Winner banner -->
      <div
        class="mb-8 overflow-hidden rounded-xl border
          p-6 sm:p-8"
        :class="[
          game.winner === 'good'
            ? 'border-[color-mix(in_srgb,var(--color-good)_20%,transparent)] bg-[color-mix(in_srgb,var(--color-good)_6%,transparent)]'
            : 'border-[color-mix(in_srgb,var(--color-evil)_20%,transparent)] bg-[color-mix(in_srgb,var(--color-evil)_6%,transparent)]',
        ]"
      >
        <div
          class="flex flex-col gap-4 sm:flex-row
            sm:items-center sm:justify-between"
        >
          <div>
            <h1
              class="font-heading text-2xl font-bold
                tracking-tight sm:text-3xl"
            >
              {{ formatDate(game.date) }}
            </h1>

            <div
              class="mt-3 flex flex-wrap items-center
                gap-2 sm:gap-3"
            >
              <Tag
                :value="getScriptLabel(game.script)"
                severity="secondary"
                rounded
                class="!text-sm"
              />
              <Tag
                v-if="game.script === 'custom'
                  && game.custom_script_name"
                :value="game.custom_script_name"
                severity="secondary"
                rounded
                class="!text-sm"
              />
              <span
                v-if="game.player_count"
                class="flex items-center gap-1.5
                  text-sm text-text-muted"
              >
                <i class="pi pi-users" />
                {{ game.player_count }} гравців
              </span>
              <span
                v-if="game.storyteller"
                class="hidden items-center gap-1.5
                  text-sm text-text-muted lg:flex"
              >
                <i class="pi pi-book" />
                {{ game.storyteller.nickname }}
              </span>
              <!-- MVP: mobile -->
              <NuxtLink
                v-if="mvpPlayer"
                :to="`/players/${mvpPlayer.id}`"
                class="inline-flex items-center gap-1
                  text-sm text-accent transition-opacity
                  hover:opacity-80 lg:hidden"
              >
                <i class="pi pi-star-fill text-xs" />
                {{ mvpPlayer.nickname }}
              </NuxtLink>
            </div>
          </div>

          <!-- Right side badges (desktop) -->
          <div class="hidden items-stretch gap-4 lg:flex">
            <!-- MVP badge: desktop -->
            <NuxtLink
              v-if="mvpPlayer"
              :to="`/players/${mvpPlayer.id}`"
              class="flex shrink-0 flex-col items-center
                justify-center gap-1 rounded-xl
                bg-accent/10 px-5 py-3 text-accent
                transition-opacity hover:opacity-80"
            >
              <span class="relative">
                <PlayerAvatar
                  :avatar-url="mvpPlayer.avatar_url"
                  :nickname="mvpPlayer.nickname"
                  size="sm"
                  ring-class="ring-1 ring-accent/40"
                />
                <i
                  class="pi pi-star-fill absolute
                    -right-1 -top-1 text-[10px]
                    text-accent drop-shadow-sm"
                />
              </span>
              <span class="text-xs font-medium">
                {{ mvpPlayer.nickname }}
              </span>
            </NuxtLink>

            <!-- Winner badge -->
            <div
              class="flex items-center justify-center
                gap-3 rounded-xl px-5 py-3"
              :class="[
                game.winner === 'good'
                  ? 'bg-[color-mix(in_srgb,var(--color-good)_15%,transparent)]'
                  : 'bg-[color-mix(in_srgb,var(--color-evil)_15%,transparent)]',
              ]"
            >
              <div>
                <p
                  class="text-xs uppercase
                    tracking-wider text-text-muted"
                >
                  Переможець
                </p>
                <div class="flex items-center gap-2">
                  <i
                    class="text-lg sm:text-xl"
                    :class="[
                      winnerInfo?.icon,
                      game.winner === 'good'
                        ? 'text-good'
                        : 'text-evil',
                    ]"
                  />
                  <p
                    class="font-heading text-lg
                      font-bold sm:text-xl"
                    :class="[
                      game.winner === 'good'
                        ? 'text-good'
                        : 'text-evil',
                    ]"
                  >
                    {{
                      winnerInfo?.labelUa
                        ?? game.winner
                    }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Notes -->
        <p
          v-if="game.notes"
          class="mt-4 rounded-lg border
            border-white/[0.06] bg-white/[0.03]
            px-4 py-3 text-sm leading-relaxed
            text-text-muted"
        >
          {{ game.notes }}
        </p>
      </div>

      <!-- Players -->
      <GamePlayersPanel
        ref="panelRef"
        :game-id="gameId"
        :winner="game.winner"
        @mvp-changed="refreshGame"
      />
    </template>
  </div>
</template>
