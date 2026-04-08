<script setup lang="ts">
import type { RolePlayCount } from '~/types'
import PlayerRoleItem
  from '~/components/players/PlayerRoleItem.vue'

const props = defineProps<{
  roles: RolePlayCount[]
}>()

const showAll = ref(false)
const INITIAL_COUNT = 10

const displayedRoles = computed(() =>
  showAll.value
    ? props.roles
    : props.roles.slice(0, INITIAL_COUNT),
)

const hasMore = computed(() =>
  props.roles.length > INITIAL_COUNT,
)

const totalPlays = computed(() =>
  props.roles.reduce((sum, r) => sum + r.count, 0),
)

const uniqueRoles = computed(() => props.roles.length)

const leftColumn = computed(() => {
  const mid = Math.ceil(displayedRoles.value.length / 2)
  return displayedRoles.value.slice(0, mid)
})

const rightColumn = computed(() => {
  const mid = Math.ceil(displayedRoles.value.length / 2)
  return displayedRoles.value.slice(mid)
})
</script>

<template>
  <div class="relative overflow-hidden">
    <div class="p-5 sm:p-6">
      <!-- Header row -->
      <div class="flex items-baseline justify-between gap-4">
        <h3 class="font-heading text-lg font-semibold">
          Зіграні ролі
        </h3>
        <span
          v-if="roles.length > 0"
          class="shrink-0 text-sm tabular-nums text-text-muted"
        >
          {{ uniqueRoles }} {{ uniqueRoles === 1 ? 'роль' : 'ролей' }}
          /
          {{ totalPlays }} {{ totalPlays === 1 ? 'гра' : 'ігор' }}
        </span>
      </div>

      <!-- Mobile: single column -->
      <div
        v-if="roles.length > 0"
        class="mt-4 flex flex-col lg:hidden"
      >
        <PlayerRoleItem
          v-for="(role, index) in displayedRoles"
          :key="role.roleNameEn"
          :role="role"
          :index="index"
          class="border-b border-white/[0.04]
            py-3 last:border-b-0"
        />
      </div>

      <!-- Desktop: two columns -->
      <div
        v-if="roles.length > 0"
        class="mt-4 hidden grid-cols-2 lg:grid"
      >
        <!-- Left column -->
        <div class="border-r border-white/[0.06]">
          <PlayerRoleItem
            v-for="(role, index) in leftColumn"
            :key="role.roleNameEn"
            :role="role"
            :index="index"
            class="px-4 py-3 pr-5"
            :class="index < leftColumn.length - 1
              ? 'border-b border-white/[0.04]' : ''"
          />
        </div>
        <!-- Right column -->
        <div>
          <PlayerRoleItem
            v-for="(role, colIndex) in rightColumn"
            :key="role.roleNameEn"
            :role="role"
            :index="colIndex + leftColumn.length"
            class="py-3 pl-5 pr-4"
            :class="colIndex < leftColumn.length - 1
              ? 'border-b border-white/[0.04]' : ''"
          />
        </div>
      </div>

      <!-- Show more / less button -->
      <div
        v-if="hasMore"
        class="mt-3 flex justify-center"
      >
        <button
          class="flex items-center gap-1.5 rounded-lg
            px-4 py-2 text-xs font-medium text-text-muted
            transition-colors hover:bg-white/[0.04]
            hover:text-text"
          @click="showAll = !showAll"
        >
          <i
            :class="showAll
              ? 'pi pi-chevron-up'
              : 'pi pi-chevron-down'"
            class="text-[10px]"
          />
          {{ showAll
            ? 'Згорнути'
            : `Показати всі (${roles.length})`
          }}
        </button>
      </div>

      <!-- Empty state -->
      <div
        v-if="roles.length === 0"
        class="flex h-48 flex-col items-center
          justify-center gap-2"
      >
        <i
          class="pi pi-users text-3xl text-text-subtle"
        />
        <p class="text-sm text-text-muted">
          Немає даних для відображення
        </p>
      </div>
    </div>
  </div>
</template>
