<script setup lang="ts">
import type { Role } from '~/composables/useRoles'
import { getRoleTypeColor, getRoleTypeInfo } from '~/composables/useRoleTypes'

const props = defineProps<{
  role: Role
}>()

const emit = defineEmits<{
  select: [role: Role]
}>()

const typeInfo = computed(() => getRoleTypeInfo(props.role.type))
const typeColor = computed(() => getRoleTypeColor(props.role.type))
</script>

<template>
  <div
    class="group flex cursor-pointer flex-col items-center
      rounded-lg bg-surface-card p-3
      transition-all hover:-translate-y-1 hover:bg-surface-hover"
    @click="emit('select', role)"
  >
    <div class="relative mb-2 size-16 sm:size-20">
      <img
        v-if="role.image_url"
        :src="role.image_url"
        :alt="role.name_en"
        class="size-full rounded-full object-cover"
        loading="lazy"
      >
      <div
        v-else
        class="flex size-full items-center justify-center
          rounded-full bg-surface-hover text-2xl text-text-muted"
      >
        ?
      </div>
    </div>

    <p class="text-center text-sm font-medium leading-tight text-text">
      {{ role.name_ua }}
    </p>
    <p class="text-center text-xs leading-tight text-text-muted">
      {{ role.name_en }}
    </p>

    <span
      class="mt-2 inline-block rounded-full px-2 py-0.5
        text-[10px] font-semibold uppercase tracking-wider"
      :style="{
        backgroundColor: `oklch(from ${typeColor} l c h / 0.15)`,
        color: typeColor,
      }"
    >
      {{ typeInfo?.label ?? role.type }}
    </span>
  </div>
</template>
