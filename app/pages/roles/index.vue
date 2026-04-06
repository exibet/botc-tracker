<script setup lang="ts">
import type { Role } from '~/composables/useRoles'

const {
  filteredRoles,
  groupedRoles,
  filterType,
  filterEdition,
  searchQuery,
  status,
} = useRoles()

const selectedRole = ref<Role | null>(null)
const dialogVisible = ref(false)

function onSelectRole(role: Role) {
  selectedRole.value = role
  dialogVisible.value = true
}

const isLoading = computed(() => status.value === 'pending')
</script>

<template>
  <div class="flex flex-col gap-6">
    <div>
      <h1 class="font-heading text-3xl font-bold">
        Каталог ролей
      </h1>
      <p class="mt-1 text-text-muted">
        <template v-if="!isLoading">
          {{ filteredRoles.length }} ролей
        </template>
        <template v-else>
          Завантаження...
        </template>
      </p>
    </div>

    <RolesRoleFilter
      v-model:filter-type="filterType"
      v-model:filter-edition="filterEdition"
      v-model:search-query="searchQuery"
    />

    <RolesRoleGrid
      :groups="groupedRoles"
      :loading="isLoading"
      @select="onSelectRole"
    />

    <RolesRoleDetailDialog
      v-model:visible="dialogVisible"
      :role="selectedRole"
    />
  </div>
</template>
