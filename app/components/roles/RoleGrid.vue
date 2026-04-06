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
    class="flex flex-col"
  >
    <div
      v-for="i in 8"
      :key="i"
      class="flex animate-pulse items-center gap-3
        border-b border-white/[0.06] px-4 py-3.5
        sm:px-6"
    >
      <div
        class="size-10 shrink-0 rounded-full
          bg-white/[0.06]"
      />
      <div class="flex flex-1 flex-col gap-1.5">
        <div class="h-4 w-32 rounded bg-white/[0.06]" />
        <div class="h-3 w-full max-w-xs rounded bg-white/[0.04]" />
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
    class="flex flex-col gap-8"
  >
    <section
      v-for="{ type, roles } in groups"
      :key="type.value"
    >
      <div
        class="sticky top-0 z-10 flex items-center
          gap-2 bg-[var(--botc-night-950)]
          px-4 py-3 backdrop-blur-sm sm:px-6"
        :style="{
          borderBottom: `1px solid color-mix(in srgb, ${type.color} 25%, transparent)`,
        }"
      >
        <span
          class="inline-block size-2 rounded-full"
          :style="{ backgroundColor: type.color }"
        />
        <h2
          class="font-heading text-sm font-semibold
            uppercase tracking-widest"
          :style="{ color: type.color }"
        >
          {{ type.label }}
        </h2>
        <span class="text-xs text-text-subtle">
          {{ roles.length }}
        </span>
      </div>
      <div class="flex flex-col">
        <RolesRoleCard
          v-for="(role, index) in roles"
          :key="role.id"
          :role="role"
          :is-last="index === roles.length - 1"
        />
      </div>
    </section>
  </div>
</template>
