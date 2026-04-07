<script setup lang="ts">
import { getRoleTypeColor } from '~/composables/useRoleTypes'

const props = defineProps<{
  imageUrl: string | null | undefined
  name: string
  type: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
}>()

const sizeClass = computed(() => {
  switch (props.size) {
    case 'xs': return 'size-5'
    case 'sm': return 'size-6'
    case 'md': return 'size-9'
    case 'lg': return 'size-10'
    default: return 'size-10'
  }
})

const textClass = computed(() => {
  switch (props.size) {
    case 'xs': return 'text-[8px]'
    case 'sm': return 'text-[10px]'
    case 'md': return 'text-sm'
    case 'lg': return 'text-sm'
    default: return 'text-sm'
  }
})

const ringClass = computed(() =>
  props.size === 'xs' || props.size === 'sm'
    ? 'ring-1'
    : 'ring-2',
)

const color = computed(
  () => getRoleTypeColor(props.type),
)
</script>

<template>
  <img
    v-if="imageUrl"
    :src="imageUrl"
    :alt="name"
    class="shrink-0 rounded-full object-cover"
    :class="[sizeClass, ringClass]"
    :style="{
      '--tw-ring-color':
        `color-mix(in srgb, ${color} 40%, transparent)`,
    }"
    loading="lazy"
  >
  <div
    v-else
    class="flex shrink-0 items-center justify-center
      rounded-full font-bold"
    :class="[sizeClass, textClass, ringClass]"
    :style="{
      'background-color':
        `color-mix(in srgb, ${color} 20%, transparent)`,
      '--tw-ring-color':
        `color-mix(in srgb, ${color} 40%, transparent)`,
      'color': color,
    }"
  >
    {{ name.charAt(0) }}
  </div>
</template>
