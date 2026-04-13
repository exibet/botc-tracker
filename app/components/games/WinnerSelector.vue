<script setup lang="ts">
import { WINNERS } from '~/composables/useGameLabels'

defineProps<{
  modelValue: string | null
  size?: 'sm' | 'lg'
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <div class="flex gap-3">
    <button
      v-for="w in WINNERS"
      :key="w.value"
      type="button"
      class="flex flex-1 cursor-pointer items-center
        justify-center gap-3 rounded-xl
        border-2 transition-all duration-200"
      :class="[
        size === 'sm'
          ? 'px-4 py-3'
          : 'px-6 py-4 sm:flex-none sm:min-w-48',
        modelValue === w.value
          ? w.value === 'good'
            ? `border-good shadow-[0_0_20px_-4px_var(--color-good)]
               bg-[color-mix(in_srgb,var(--color-good)_12%,transparent)]`
            : `border-evil shadow-[0_0_20px_-4px_var(--color-evil)]
               bg-[color-mix(in_srgb,var(--color-evil)_12%,transparent)]`
          : 'border-white/[0.08] bg-white/[0.02] hover:border-white/[0.15] hover:bg-white/[0.04]',
      ]"
      data-testid="game-winner"
      @click="emit('update:modelValue', w.value)"
    >
      <i
        :class="[
          w.icon,
          modelValue === w.value
            ? w.value === 'good'
              ? 'text-good'
              : 'text-evil'
            : 'text-text-muted',
        ]"
        class="text-2xl"
        :style="size === 'sm' ? 'font-size: 1.25rem' : ''"
      />
      <span
        class="font-heading font-bold"
        :class="[
          size === 'sm' ? 'text-base' : 'text-lg',
          modelValue === w.value
            ? w.value === 'good'
              ? 'text-good'
              : 'text-evil'
            : 'text-text-muted',
        ]"
      >
        {{ w.labelUa }}
      </span>
    </button>
  </div>
</template>
