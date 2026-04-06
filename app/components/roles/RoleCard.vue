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
    class="group flex cursor-pointer flex-col gap-3
      rounded-xl bg-surface-card p-3
      transition-colors duration-150
      hover:bg-white/[0.06]"
    @click="emit('select', role)"
  >
    <div class="flex justify-center">
      <img
        v-if="role.image_url"
        :src="role.image_url"
        :alt="role.name_en"
        class="size-14 rounded-full object-cover
          ring-1 ring-white/10"
        loading="lazy"
      >
      <div
        v-else
        class="flex size-14 items-center justify-center
          rounded-full bg-surface-hover
          text-xl text-text-muted
          ring-1 ring-white/10"
      >
        ?
      </div>
    </div>

    <div class="flex min-w-0 flex-col gap-1">
      <p
        class="truncate text-sm font-semibold
          leading-tight text-text"
      >
        {{ role.name_ua }}
      </p>
      <p
        class="line-clamp-2 text-xs leading-snug
          text-white/50"
      >
        {{ role.description_ua }}
      </p>
    </div>
  </div>
</template>
