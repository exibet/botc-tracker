<script setup lang="ts">
defineProps<{
  value: string | number
  label: string
  icon: string
  color?: 'good' | 'evil' | 'accent' | 'text'
  to?: string
}>()

const NuxtLink = resolveComponent('NuxtLink')

const colorClass = {
  good: 'text-good',
  evil: 'text-evil',
  accent: 'text-accent',
  text: 'text-text',
} as const
</script>

<template>
  <component
    :is="to ? NuxtLink : 'div'"
    :to="to || undefined"
    class="rounded-xl border border-white/[0.06]
      bg-white/[0.02]"
    :class="to
      ? 'transition-colors hover:bg-white/[0.05]'
      : ''"
  >
    <!-- Mobile: inline icon + value -->
    <div
      class="flex items-center justify-center
        gap-1.5 px-2 py-2 sm:hidden"
    >
      <i
        class="text-xs"
        :class="[icon, colorClass[color ?? 'accent']]"
      />
      <p
        class="font-heading text-lg font-bold"
        :class="colorClass[color ?? 'text']"
      >
        {{ value }}
      </p>
    </div>
    <!-- Desktop: stacked value + label -->
    <div class="hidden p-4 text-center sm:block">
      <p
        class="font-heading text-2xl font-bold"
        :class="colorClass[color ?? 'text']"
      >
        {{ value }}
      </p>
      <p class="mt-1 text-xs text-text-muted sm:text-sm">
        <i
          :class="[
            icon,
            'mr-1 text-xs',
            colorClass[color ?? 'accent'],
          ]"
        />
        {{ label }}
      </p>
    </div>
  </component>
</template>
