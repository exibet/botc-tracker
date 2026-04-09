<script setup lang="ts">
defineProps<{
  value: string | number
  label: string
  icon: string
  color?: 'good' | 'evil' | 'accent' | 'text'
  to?: string
}>()

const colorClass = {
  good: 'text-good',
  evil: 'text-evil',
  accent: 'text-accent',
  text: 'text-text',
} as const
</script>

<template>
  <component
    :is="to ? 'NuxtLink' : 'div'"
    :to="to || undefined"
    class="rounded-xl border border-white/[0.06]
      bg-white/[0.02] p-4 text-center"
    :class="to
      ? 'transition-colors hover:bg-white/[0.05]'
      : ''"
  >
    <p
      class="font-heading text-2xl font-bold
        sm:text-3xl"
      :class="colorClass[color ?? 'text']"
    >
      {{ value }}
    </p>
    <p
      class="mt-1 text-xs text-text-muted
        sm:text-sm"
    >
      <i
        :class="[
          icon,
          'mr-1 text-xs',
          colorClass[color ?? 'accent'],
        ]"
      />
      {{ label }}
    </p>
  </component>
</template>
