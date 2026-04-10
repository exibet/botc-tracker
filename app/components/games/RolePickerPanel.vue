<script setup lang="ts">
import type { Role } from '~/types'
import {
  getRoleTypeInfo,
  ROLE_TYPES,
} from '~/composables/useRoleTypes'
import RoleAvatar from '~/components/games/RoleAvatar.vue'

const props = defineProps<{
  roles: Role[]
  selectedId: string | null
  compact?: boolean
  showTypeFilter?: boolean
  hiddenTypes?: string[]
}>()

const emit = defineEmits<{
  select: [role: Role]
}>()

const search = ref('')
const typeFilter = ref<string | null>(null)
const listEl = ref<HTMLElement | null>(null)

watch(typeFilter, () => {
  listEl.value?.scrollTo(0, 0)
})

const availableTypes = computed(() => {
  const hidden = new Set(props.hiddenTypes ?? [])
  return ROLE_TYPES.filter(t =>
    !hidden.has(t.value)
    && props.roles.some(r => r.type === t.value),
  )
})

const filtered = computed(() => {
  let result = props.roles

  if (typeFilter.value) {
    result = result.filter(r => r.type === typeFilter.value)
  }

  if (search.value.trim()) {
    const q = search.value.trim().toLowerCase()
    result = result.filter(
      r => r.name_ua.toLowerCase().includes(q)
        || r.name_en.toLowerCase().includes(q),
    )
  }

  return result
})

const grouped = computed(() => {
  const typeOrder = ROLE_TYPES.map(t => t.value)
  const groups: {
    type: string
    label: string
    color: string
    roles: Role[]
  }[] = []

  for (const type of typeOrder) {
    const info = getRoleTypeInfo(type)
    if (!info) continue
    const rolesOfType = filtered.value.filter(
      r => r.type === type,
    )
    if (rolesOfType.length > 0) {
      groups.push({
        type,
        label: info.label,
        color: info.color,
        roles: rolesOfType.toSorted((a, b) =>
          a.name_ua.localeCompare(b.name_ua, 'uk'),
        ),
      })
    }
  }

  return groups
})

function handleSelect(role: Role) {
  emit('select', role)
}
</script>

<template>
  <div
    class="overflow-hidden rounded-xl border
      border-white/[0.08]
      bg-[var(--botc-night-950)]"
  >
    <!-- Type filters -->
    <div
      v-if="showTypeFilter"
      class="grid grid-cols-2 gap-1.5
        border-b border-white/[0.06] px-3 py-2.5
        sm:grid-cols-4"
    >
      <button
        v-for="t in availableTypes"
        :key="t.value"
        type="button"
        class="type-chip"
        :class="typeFilter === t.value
          ? 'type-chip-active' : ''"
        :style="{ '--chip-color': t.color }"
        @click="typeFilter = typeFilter === t.value
          ? null : t.value"
      >
        {{ t.label }}
      </button>
    </div>

    <!-- Search -->
    <div class="border-b border-white/[0.06] p-3">
      <IconField>
        <InputIcon class="pi pi-search" />
        <InputText
          v-model="search"
          placeholder="Пошук ролі..."
          fluid
          class="!bg-white/[0.04]"
          :class="compact ? '!text-sm' : ''"
        />
      </IconField>
    </div>

    <!-- Grouped roles -->
    <div
      ref="listEl"
      class="overflow-y-auto"
      :class="compact ? 'max-h-[27rem]' : 'max-h-96'"
    >
      <div
        v-if="grouped.length === 0"
        class="py-8 text-center text-sm text-text-muted"
      >
        Ролей не знайдено
      </div>

      <div
        v-for="group in grouped"
        :key="group.type"
      >
        <!-- Group header -->
        <div
          class="sticky top-0 z-10 flex items-center
            gap-2 bg-[var(--botc-night-950)] px-4 py-2
            backdrop-blur-sm"
          :style="{
            borderBottom:
              `1px solid color-mix(in srgb, ${group.color} 25%, transparent)`,
          }"
        >
          <span
            class="inline-block size-2 rounded-full"
            :style="{ backgroundColor: group.color }"
          />
          <span
            class="text-xs font-semibold uppercase
              tracking-widest"
            :style="{ color: group.color }"
          >
            {{ group.label }}
          </span>
          <span class="text-xs text-text-subtle">
            {{ group.roles.length }}
          </span>
        </div>

        <!-- Role items -->
        <button
          v-for="role in group.roles"
          :key="role.id"
          type="button"
          class="flex w-full cursor-pointer items-center
            gap-3 px-4 py-3 text-left
            transition-colors duration-100
            hover:bg-white/[0.05]"
          :class="[
            selectedId === role.id
              ? 'bg-white/[0.06]'
              : '',
          ]"
          @click="handleSelect(role)"
        >
          <RoleAvatar
            :image-url="role.image_url"
            :name="role.name_ua"
            :type="role.type"
            size="md"
          />
          <div class="min-w-0 flex-1">
            <p class="text-sm font-medium text-text">
              {{ role.name_ua }}
            </p>
            <p
              class="truncate text-xs text-text-subtle"
            >
              {{ role.name_en }}
            </p>
          </div>
          <i
            v-if="selectedId === role.id"
            class="pi pi-check text-sm text-primary"
          />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.type-chip {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.8125rem;
  font-weight: 500;
  border: 1px solid color-mix(
    in srgb, var(--chip-color) 20%, transparent
  );
  background: color-mix(
    in srgb, var(--chip-color) 8%, transparent
  );
  color: color-mix(
    in srgb, var(--chip-color) 70%, #9ca3af
  );
  cursor: pointer;
  transition: all 0.15s;
}

.type-chip:hover {
  background: color-mix(
    in srgb, var(--chip-color) 14%, transparent
  );
  border-color: color-mix(
    in srgb, var(--chip-color) 30%, transparent
  );
  color: color-mix(
    in srgb, var(--chip-color) 85%, #d1d5db
  );
}

.type-chip-active {
  background: color-mix(
    in srgb, var(--chip-color) 20%, transparent
  );
  border-color: color-mix(
    in srgb, var(--chip-color) 50%, transparent
  );
  color: var(--chip-color);
  font-weight: 600;
}
</style>
