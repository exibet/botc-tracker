<script setup lang="ts">
defineProps<{
  value: string | number
  label: string
  icon: string
  color?: 'good' | 'evil' | 'accent' | 'text'
  to?: string
}>()
</script>

<template>
  <component
    :is="to ? resolveComponent('NuxtLink') : 'div'"
    :to="to"
    class="rounded-xl border border-white/[0.06]
      bg-white/[0.02] p-4 text-center"
    :class="to
      ? 'transition-colors hover:bg-white/[0.05]'
      : ''"
  >
    <p
      class="font-heading text-2xl font-bold
        sm:text-3xl"
      :class="{
        'text-good': color === 'good',
        'text-evil': color === 'evil',
        'text-accent': color === 'accent',
        'text-text': !color || color === 'text',
      }"
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
          {
            'text-good': color === 'good',
            'text-evil': color === 'evil',
            'text-accent': color === 'accent'
              || !color || color === 'text',
          },
        ]"
      />
      {{ label }}
    </p>
  </component>
</template>
