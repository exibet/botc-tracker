<script setup lang="ts">
import type { RoleGrouped } from '~/composables/useRoles'

defineProps<{
  groups: RoleGrouped[]
  loading: boolean
}>()
</script>

<template>
  <div
    v-if="loading"
    class="flex flex-col gap-2"
  >
    <div
      v-for="i in 8"
      :key="i"
      class="flex animate-pulse items-center gap-3
        rounded-lg bg-surface-card px-4 py-3"
    >
      <div
        class="size-10 shrink-0 rounded-full
          bg-surface-hover"
      />
      <div class="flex flex-1 flex-col gap-1">
        <div class="h-4 w-32 rounded bg-surface-hover" />
        <div class="h-3 w-full rounded bg-surface-hover" />
      </div>
    </div>
  </div>

  <div
    v-else-if="groups.length === 0"
    class="flex flex-col items-center justify-center
      py-16 text-text-muted"
  >
    <span class="mb-2 text-4xl">~</span>
    <p class="text-lg">
      Ролей не знайдено
    </p>
    <p class="text-sm">
      Спробуйте змінити фільтри або пошуковий запит
    </p>
  </div>

  <div
    v-else
    class="flex flex-col gap-6"
  >
    <section
      v-for="{ type, roles } in groups"
      :key="type.value"
    >
      <div
        class="sticky top-0 z-10 flex items-center
          gap-2 border-b border-surface-card
          bg-surface-ground/95 px-4 py-2
          backdrop-blur-sm sm:px-6"
      >
        <span
          class="inline-block size-2.5 rounded-full"
          :style="{ backgroundColor: type.color }"
        />
        <h2
          class="font-heading text-sm font-semibold
            uppercase tracking-widest"
          :style="{ color: type.color }"
        >
          {{ type.label }}
        </h2>
        <span class="text-xs text-text-muted">
          ({{ roles.length }})
        </span>
      </div>
      <div class="flex flex-col">
        <RolesRoleCard
          v-for="role in roles"
          :key="role.id"
          :role="role"
        />
      </div>
    </section>
  </div>
</template>
