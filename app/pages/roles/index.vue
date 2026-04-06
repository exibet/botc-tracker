<script setup lang="ts">
const {
  filteredRoles,
  groupedRoles,
  filterType,
  filterEdition,
  searchQuery,
  status,
} = useRoles()

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
    />
  </div>
</template>
