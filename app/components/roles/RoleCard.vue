<script setup lang="ts">
import type { Role } from '~/composables/useRoles'

defineProps<{
  role: Role
}>()

const emit = defineEmits<{
  select: [role: Role]
}>()
</script>

<template>
  <div
    class="group flex cursor-pointer flex-col items-center
      rounded-lg bg-surface-card p-4 text-center
      transition-all hover:-translate-y-0.5
      hover:shadow-lg"
    @click="emit('select', role)"
  >
    <div
      class="mx-auto mb-3 size-16 overflow-hidden
        rounded-full ring-2 ring-surface-border
        transition-all sm:size-20"
    >
      <img
        v-if="role.image_url"
        :src="role.image_url"
        :alt="role.name_en"
        class="size-full object-cover"
        loading="lazy"
      >
      <div
        v-else
        class="flex size-full items-center justify-center
          bg-surface-hover text-2xl text-text-muted"
      >
        ?
      </div>
    </div>

    <p
      class="text-sm font-semibold leading-tight text-text"
    >
      {{ role.name_ua }}
    </p>
  </div>
</template>
