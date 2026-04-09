<script setup lang="ts">
defineProps<{
  streak: number
  size?: 'sm' | 'md'
}>()
</script>

<template>
  <span
    v-if="streak >= 3"
    class="inline-flex shrink-0 items-center
      gap-0.5 rounded-full font-semibold text-win"
    :class="size === 'sm'
      ? 'px-1.5 py-0.5 text-[9px]'
      : 'gap-1 px-2.5 py-0.5 text-xs'"
    style="background: rgba(16, 185, 129, 0.12)"
  >
    <i
      class="pi pi-bolt"
      :class="size === 'sm'
        ? 'text-[7px]' : 'text-[10px]'"
    />
    {{ streak }}W STREAK
  </span>
</template>
