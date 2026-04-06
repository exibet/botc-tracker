<script setup lang="ts">
import type { Role } from '~/composables/useRoles'

defineProps<{
  roles: Role[]
  loading: boolean
}>()

const emit = defineEmits<{
  select: [role: Role]
}>()
</script>

<template>
  <div
    v-if="loading"
    class="grid grid-cols-2 gap-3 sm:grid-cols-3
      md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
  >
    <div
      v-for="i in 12"
      :key="i"
      class="flex animate-pulse flex-col items-center rounded-lg bg-surface-card p-3"
    >
      <div class="mb-2 size-16 rounded-full bg-surface-hover sm:size-20" />
      <div class="mb-1 h-4 w-20 rounded bg-surface-hover" />
      <div class="h-3 w-16 rounded bg-surface-hover" />
      <div class="mt-2 h-4 w-14 rounded-full bg-surface-hover" />
    </div>
  </div>

  <div
    v-else-if="roles.length === 0"
    class="flex flex-col items-center justify-center py-16 text-text-muted"
  >
    <span class="mb-2 text-4xl">
      ~
    </span>
    <p class="text-lg">
      Ролей не знайдено
    </p>
    <p class="text-sm">
      Спробуйте змінити фільтри або пошуковий запит
    </p>
  </div>

  <div
    v-else
    class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
  >
    <RolesRoleCard
      v-for="role in roles"
      :key="role.id"
      :role="role"
      @select="emit('select', role)"
    />
  </div>
</template>
