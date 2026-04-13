<script setup lang="ts">
const router = useRouter()
const route = useRoute()
const { profile } = useAuth()

const returnTo = computed(() => {
  const path = route.query.returnTo as string | undefined
  return path && path.startsWith('/') && !path.startsWith('//')
    ? path
    : '/'
})

// SSR auth loads profile via server middleware.
// Client plugin handles SIGNED_IN event and calls loadProfile().
// Watch for profile to appear, then redirect.
watch(profile, (p) => {
  if (p) {
    router.replace(returnTo.value)
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
