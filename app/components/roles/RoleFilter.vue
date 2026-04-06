<script setup lang="ts">
import { EDITIONS, ROLE_TYPES } from '~/composables/useRoleTypes'

const filterType = defineModel<string | null>('filterType')
const filterEdition = defineModel<string | null>('filterEdition')
const searchQuery = defineModel<string>('searchQuery')

const typeOptions = [
  { value: null, label: 'Усі типи' },
  ...ROLE_TYPES.map(t => ({ value: t.value, label: t.label })),
]

const editionOptions = [
  { value: null, label: 'Усі видання' },
  ...EDITIONS.map(e => ({ value: e.value, label: e.label })),
]
</script>

<template>
  <div
    class="flex flex-col gap-3 sm:flex-row sm:items-center"
  >
    <Select
      :model-value="filterType"
      :options="typeOptions"
      option-label="label"
      option-value="value"
      placeholder="Тип ролі"
      class="w-full sm:w-48"
      @update:model-value="filterType = $event"
    />
    <Select
      :model-value="filterEdition"
      :options="editionOptions"
      option-label="label"
      option-value="value"
      placeholder="Видання"
      class="w-full sm:w-48"
      @update:model-value="filterEdition = $event"
    />
    <InputText
      v-model="searchQuery"
      placeholder="Пошук по імені..."
      class="w-full sm:w-64"
    />
  </div>
</template>
