<script setup lang="ts">
defineProps<{
  label: string
  colorClass?: string
}>()
</script>

<template>
  <div
    class="rounded-xl border border-white/10
      px-3 py-3 text-center"
  >
    <p
      class="font-heading text-2xl font-bold
        sm:text-3xl"
      :class="colorClass ?? 'text-text'"
    >
      <slot />
    </p>
    <p class="mt-0.5 text-[11px] text-text-muted">
      {{ label }}
    </p>
  </div>
</template>
