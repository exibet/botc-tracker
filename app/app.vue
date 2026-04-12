<script setup lang="ts">
useHead({
  htmlAttrs: { class: 'dark' },
})

// Fetch global data once at app level — SSR suspense ensures data is in payload
const { initRoles } = useRoles()
const { initPlayers } = usePlayers()
await Promise.all([initRoles(), initPlayers()]).catch(() => {})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <Toast />
</template>
