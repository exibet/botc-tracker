<script setup lang="ts">
useHead({
  htmlAttrs: { class: 'dark' },
})

const { initRoles } = useRoles()
await initRoles().catch(() => {})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <Toast />
</template>
