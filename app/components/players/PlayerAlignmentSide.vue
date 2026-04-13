<script setup lang="ts">
defineProps<{
  label: string
  icon: string
  color: 'good' | 'evil'
  games: number
  winRate: number
}>()
</script>

<template>
  <div class="flex flex-col gap-2">
    <span
      class="hidden items-center gap-1.5 justify-center
        text-xs font-semibold uppercase
        tracking-wide sm:flex"
      :class="`text-${color}`"
    >
      <i :class="icon" />
      {{ label }}
    </span>
    <p
      class="font-heading text-2xl
        font-bold leading-none"
      :class="`text-${color}`"
    >
      {{ games }}
      <span
        class="text-xs font-medium"
        :class="`text-${color}/60`"
      >
        ігор
      </span>
    </p>
    <div class="flex flex-col gap-1">
      <div
        class="flex items-center
          justify-between text-[11px]"
      >
        <span class="text-text-muted">
          Вінрейт
        </span>
        <span
          class="font-semibold"
          :class="`text-${color}`"
        >
          {{ winRate }}%
        </span>
      </div>
      <div
        class="h-1.5 overflow-hidden
          rounded-full bg-white/[0.06]"
      >
        <div
          class="h-full rounded-full
            transition-all duration-500"
          :class="`bg-${color}`"
          :style="{ width: `${winRate}%` }"
        />
      </div>
    </div>
  </div>
</template>
