<script setup lang="ts">
import type { GameWithDetails } from '#shared/types'
import {
  getScriptLabel,
  getWinnerInfo,
  getGameStatusInfo,
} from '~/composables/useGameLabels'
import PlayerAvatar
  from '~/components/players/PlayerAvatar.vue'

const props = defineProps<{
  game: GameWithDetails
}>()

const winnerInfo = computed(
  () => getWinnerInfo(props.game.winner),
)

const statusInfo = computed(
  () => getGameStatusInfo(props.game.status),
)

const sideCounts = computed(() => {
  if (!props.game.game_players?.length) return null
  let good = 0
  let evil = 0
  for (const p of props.game.game_players) {
    const a = p.alignment_end ?? p.alignment_start
    if (a === 'good') good++
    else if (a === 'evil') evil++
  }
  return { good, evil }
})

const mvpPlayer = computed(
  () => props.game.mvp_player ?? null,
)

const hoverShadowClass = computed(() => {
  if (props.game.winner === 'good')
    return 'hover:shadow-[0_0_24px_-6px_var(--color-good)]'
  if (props.game.winner === 'evil')
    return 'hover:shadow-[0_0_24px_-6px_var(--color-evil)]'
  if (props.game.status === 'in_progress')
    return 'hover:shadow-[0_0_24px_-6px_rgb(245,158,11)]'
  return 'hover:shadow-[0_0_24px_-6px_rgb(34,197,94)]'
})
</script>

<template>
  <NuxtLink
    :to="`/games/${game.id}`"
    class="group block rounded-xl border
      border-white/[0.06] p-5
      transition-all duration-200
      hover:border-white/[0.12] hover:bg-white/[0.03]
      sm:p-6"
    :class="[hoverShadowClass]"
    data-testid="game-card"
  >
    <div class="flex items-start gap-4 sm:gap-6">
      <!-- Winner badge (finished games) -->
      <div
        v-if="game.winner"
        class="flex size-14 shrink-0 flex-col
          items-center justify-center rounded-lg
          sm:size-16 gap-1"
        :class="[
          'ring-1',
          game.winner === 'good'
            ? 'badge-good'
            : 'badge-evil',
        ]"
      >
        <i
          class="text-xl"
          :class="[
            winnerInfo?.icon,
            game.winner === 'good'
              ? 'text-good'
              : 'text-evil',
          ]"
        />
      </div>

      <!-- Status badge (upcoming / in_progress) -->
      <div
        v-else
        class="flex size-14 shrink-0 flex-col
          items-center justify-center rounded-lg
          sm:size-16 gap-1"
        :class="[
          game.status === 'in_progress'
            ? 'bg-amber-500/[0.08] ring-1 ring-amber-500/20'
            : 'bg-green-500/[0.08] ring-1 ring-green-500/20',
        ]"
      >
        <i
          class="text-xl"
          :class="[
            statusInfo?.icon,
            game.status === 'in_progress'
              ? 'text-amber-500'
              : 'text-green-500',
          ]"
        />
      </div>

      <!-- Game info -->
      <div class="min-w-0 flex-1">
        <div class="flex flex-wrap items-center gap-2">
          <Tag
            :value="getScriptLabel(game.script)"
            severity="secondary"
            rounded
          />
        </div>

        <div
          class="mt-3 flex flex-wrap gap-4 text-sm
            text-text-muted sm:gap-6"
        >
          <span
            class="flex items-center gap-1.5"
          >
            <i
              class="text-sm"
              :class="game.player_count
                ? 'pi pi-users'
                : 'pi pi-book'"
            />
            <template v-if="game.player_count">
              {{ game.player_count }}
              <span class="hidden sm:inline">
                гравців
              </span>
            </template>
            <span v-else>
              {{ game.storyteller?.nickname
                ?? 'Оповідач' }}
            </span>
          </span>
          <template
            v-if="sideCounts
              && game.status !== 'upcoming'"
          >
            <span
              class="inline-flex items-center gap-1
                rounded-full bg-good/10 px-1.5 py-0.5
                text-[10px] font-semibold text-good"
            >
              <i class="pi pi-sun" />
              {{ sideCounts.good }}
            </span>
            <span
              class="inline-flex items-center gap-1
                rounded-full bg-evil/10 px-1.5 py-0.5
                text-[10px] font-semibold text-evil"
            >
              <i class="pi pi-moon" />
              {{ sideCounts.evil }}
            </span>
          </template>
          <!-- MVP: mobile -->
          <button
            v-if="mvpPlayer"
            type="button"
            class="inline-flex items-center gap-1
              text-accent transition-opacity
              hover:opacity-80 lg:hidden cursor-pointer"
            @click.stop.prevent="navigateTo(`/players/${mvpPlayer.id}`)"
          >
            <i class="pi pi-star-fill" />
            {{ mvpPlayer.nickname }}
          </button>
        </div>

      </div>

      <!-- MVP: desktop -->
      <button
        v-if="mvpPlayer"
        v-tooltip.top="'MVP: ' + mvpPlayer.nickname"
        type="button"
        class="hidden shrink-0 self-center
          text-accent lg:inline-flex cursor-pointer"
        @click.stop.prevent="navigateTo(`/players/${mvpPlayer.id}`)"
      >
        <span
          class="relative transition-transform
            duration-200 hover:scale-150 inline-block"
        >
          <PlayerAvatar
            :avatar-url="mvpPlayer.avatar_url"
            :nickname="mvpPlayer.nickname"
            size="sm"
            ring-class="ring-1 ring-accent/80"
          />
          <i
            class="pi pi-star-fill absolute
              -right-1 -top-1 text-[10px]
              text-accent drop-shadow-sm"
          />
        </span>
      </button>

      <!-- Arrow -->
      <i
        class="pi pi-chevron-right shrink-0 pt-1
          text-sm text-text-subtle transition-transform
          duration-200 group-hover:translate-x-0.5"
      />
    </div>
  </NuxtLink>
</template>
