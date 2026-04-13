<script setup lang="ts">
import type { Alignment } from '#shared/types'

const props = defineProps<{
  alignment: Alignment
  size?: 'xs' | 'sm'
  muted?: boolean
}>()

const tagClass = computed(() => [
  props.alignment === 'good'
    ? 'p-tag-good'
    : 'p-tag-evil',
  props.muted ? 'opacity-50' : '',
  props.size === 'xs'
    ? '!px-1 !py-0 !text-[9px]'
    : '!px-2 !py-0.5',
])
</script>

<template>
  <Tag
    :value="alignment === 'good' ? 'Добро' : 'Зло'"
    :class="tagClass"
    rounded
  />
</template>
