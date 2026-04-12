<script setup lang="ts">
useHead({
  htmlAttrs: { class: 'dark' },
})

// Fetch global data once at app level — SSR suspense ensures data is in payload
const { initRoles } = useRoles()
const { initPlayers } = usePlayers()
const { initStats } = useGameStats()
await Promise.all([initRoles(), initPlayers(), initStats()]).catch(() => {})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <Toast />
</template>
