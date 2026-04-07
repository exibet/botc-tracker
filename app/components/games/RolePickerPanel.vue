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
}>()

const emit = defineEmits<{
  select: [role: Role]
}>()

const search = ref('')

const filtered = computed(() => {
  if (!search.value.trim()) return props.roles
  const q = search.value.trim().toLowerCase()
  return props.roles.filter(
    r => r.name_ua.toLowerCase().includes(q)
      || r.name_en.toLowerCase().includes(q),
  )
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
        roles: rolesOfType,
      })
    }
  }

  return groups
})

function handleSelect(role: Role) {
  emit('select', role)
  search.value = ''
}
</script>

<template>
  <div
    class="overflow-hidden rounded-xl border
      border-white/[0.08]
      bg-[var(--botc-night-950)]"
  >
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
      class="overflow-y-auto"
      :class="compact ? 'max-h-56' : 'max-h-80'"
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
            gap-3 px-4 py-2.5 text-left
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
            :size="compact ? 'sm' : 'md'"
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
