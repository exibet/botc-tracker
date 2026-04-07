<script setup lang="ts">
import GameCard from '~/components/games/GameCard.vue'

const { games, status } = useGames()
const { isAdmin } = useAuth()
</script>

<template>
  <div>
    <div class="flex items-center justify-between">
      <h1 class="font-heading text-3xl font-bold">
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

    <div
      v-if="status === 'pending'"
      class="mt-6 space-y-4"
    >
      <Skeleton
        v-for="i in 5"
        :key="i"
        height="4rem"
      />
    </div>

    <div
      v-else-if="games?.length"
      class="mt-6 overflow-hidden rounded-lg
        border border-white/[0.06]"
    >
      <GameCard
        v-for="game in games"
        :key="game.id"
        :game="game"
      />
    </div>

    <div
      v-else
      class="mt-6 text-center text-text-muted"
    >
      <i class="pi pi-inbox mb-2 text-4xl" />
      <p>Ще немає ігор</p>
    </div>
  </div>
</template>
