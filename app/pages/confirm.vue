<script setup lang="ts">
const router = useRouter()
const { profileReady } = useAuth()

// Plugin handles profile loading via onAuthStateChange.
// Just wait for it to finish, then redirect.
watch(profileReady, (ready) => {
  if (ready) {
    router.replace('/')
  }
}, { immediate: true })
</script>

<template>
  <div class="flex min-h-[50vh] items-center justify-center">
    <p class="text-text-muted">
      Завантаження...
    </p>
  </div>
</template>
