<script setup lang="ts">
defineProps<{
  goodPct: number
  evilPct: number
  height?: string
}>()
</script>

<template>
  <div>
    <div
      class="flex overflow-hidden rounded-full
        bg-white/[0.06]"
      :class="height ?? 'h-3'"
    >
      <div
        class="rounded-l-full bg-good
          transition-all duration-500"
        :style="{ width: `${goodPct}%` }"
      />
      <div
        class="rounded-r-full bg-evil
          transition-all duration-500"
        :style="{ width: `${evilPct}%` }"
      />
    </div>
    <div
      class="mt-1 flex justify-between text-[10px]
        text-text-subtle"
    >
      <span>{{ goodPct }}% Добро</span>
      <span>{{ evilPct }}% Зло</span>
    </div>
  </div>
</template>
