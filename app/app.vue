<script setup lang="ts">
useHead({
  htmlAttrs: { class: 'dark' },
})

const { initRoles } = useRoles()
const { initStats } = useGameStats()
await Promise.all([initRoles(), initStats()]).catch(() => {})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <Toast />
</template>
