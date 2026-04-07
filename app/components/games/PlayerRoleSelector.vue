<script setup lang="ts">
import type { Profile, Role } from '~/types'

export interface PlayerEntry {
  player_id: string
  nickname: string
  starting_role_id: string
  role_name: string
  alignment_start: 'good' | 'evil'
  is_alive: boolean
  is_mvp: boolean
}

const props = defineProps<{
  players: Profile[]
  roles: Role[]
  modelValue: PlayerEntry[]
}>()

const emit = defineEmits<{
  'update:modelValue': [entries: PlayerEntry[]]
}>()

const selectedPlayer = ref<string | null>(null)
const selectedRole = ref<string | null>(null)
const roleSearch = ref('')

const availablePlayers = computed(() =>
  (props.players ?? []).filter(
    p => !props.modelValue.some(e => e.player_id === p.id),
  ),
)

const filteredRoles = computed(() => {
  if (!roleSearch.value.trim()) return props.roles ?? []
  const q = roleSearch.value.trim().toLowerCase()
  return (props.roles ?? []).filter(
    r => r.name_ua.toLowerCase().includes(q)
      || r.name_en.toLowerCase().includes(q),
  )
})

function addPlayer() {
  if (!selectedPlayer.value || !selectedRole.value) return

  const player = props.players.find(
    p => p.id === selectedPlayer.value,
  )
  const role = props.roles.find(
    r => r.id === selectedRole.value,
  )
  if (!player || !role) return

  const isGood = ['townsfolk', 'outsider']
    .includes(role.type)
  const alignment = isGood ? 'good' : 'evil'

  emit('update:modelValue', [
    ...props.modelValue,
    {
      player_id: player.id,
      nickname: player.nickname,
      starting_role_id: role.id,
      role_name: role.name_ua,
      alignment_start: alignment as 'good' | 'evil',
      is_alive: true,
      is_mvp: false,
    },
  ])

  selectedPlayer.value = null
  selectedRole.value = null
  roleSearch.value = ''
}

function removePlayer(playerId: string) {
  emit(
    'update:modelValue',
    props.modelValue.filter(e => e.player_id !== playerId),
  )
}

function toggleAlive(playerId: string) {
  emit(
    'update:modelValue',
    props.modelValue.map(e =>
      e.player_id === playerId
        ? { ...e, is_alive: !e.is_alive }
        : e,
    ),
  )
}

function toggleMvp(playerId: string) {
  emit(
    'update:modelValue',
    props.modelValue.map(e =>
      e.player_id === playerId
        ? { ...e, is_mvp: !e.is_mvp }
        : e,
    ),
  )
}
</script>

<template>
  <div data-testid="player-role-selector">
    <h3 class="mb-3 font-heading text-lg font-semibold">
      Гравці
    </h3>

    <!-- Add player row -->
    <div
      class="mb-4 flex flex-col gap-2
        sm:flex-row sm:items-end"
    >
      <div class="flex-1">
        <label
          class="mb-1 block text-sm text-text-muted"
        >
          Гравець
        </label>
        <Select
          v-model="selectedPlayer"
          :options="availablePlayers.map(p => ({
            label: p.nickname,
            value: p.id,
          }))"
          option-label="label"
          option-value="value"
          placeholder="Оберіть гравця"
          fluid
          data-testid="player-select"
        />
      </div>
      <div class="flex-1">
        <label
          class="mb-1 block text-sm text-text-muted"
        >
          Роль
        </label>
        <Select
          v-model="selectedRole"
          :options="filteredRoles.map(r => ({
            label: r.name_ua,
            value: r.id,
          }))"
          option-label="label"
          option-value="value"
          placeholder="Оберіть роль"
          filter
          fluid
          data-testid="role-select"
        />
      </div>
      <Button
        icon="pi pi-plus"
        severity="secondary"
        :disabled="!selectedPlayer || !selectedRole"
        data-testid="add-player-btn"
        @click="addPlayer"
      />
    </div>

    <!-- Players list -->
    <div
      v-if="modelValue.length"
      class="overflow-hidden rounded-lg
        border border-white/[0.06]"
    >
      <table class="w-full text-sm">
        <thead>
          <tr
            class="border-b border-white/[0.06]
              text-left"
          >
            <th
              class="px-4 py-2 font-medium
                text-text-muted"
            >
              Гравець
            </th>
            <th
              class="px-4 py-2 font-medium
                text-text-muted"
            >
              Роль
            </th>
            <th
              class="px-4 py-2 font-medium
                text-text-muted"
            >
              Бік
            </th>
            <th
              class="px-4 py-2 font-medium
                text-text-muted"
            >
              Живий
            </th>
            <th
              class="px-4 py-2 font-medium
                text-text-muted"
            >
              MVP
            </th>
            <th class="px-4 py-2" />
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="entry in modelValue"
            :key="entry.player_id"
            class="border-b border-white/[0.04]
              last:border-b-0"
            data-testid="player-entry"
          >
            <td class="px-4 py-2 font-medium">
              {{ entry.nickname }}
            </td>
            <td class="px-4 py-2">
              {{ entry.role_name }}
            </td>
            <td class="px-4 py-2">
              <Tag
                :value="entry.alignment_start === 'good'
                  ? 'Добро' : 'Зло'"
                :severity="entry.alignment_start === 'good'
                  ? 'success' : 'danger'"
                rounded
                class="!px-1.5 !py-0 !text-[10px]"
              />
            </td>
            <td class="px-4 py-2">
              <ToggleSwitch
                :model-value="entry.is_alive"
                @update:model-value="toggleAlive(
                  entry.player_id,
                )"
              />
            </td>
            <td class="px-4 py-2">
              <ToggleSwitch
                :model-value="entry.is_mvp"
                @update:model-value="toggleMvp(
                  entry.player_id,
                )"
              />
            </td>
            <td class="px-4 py-2">
              <Button
                icon="pi pi-trash"
                severity="danger"
                text
                size="small"
                @click="removePlayer(entry.player_id)"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p
      v-else
      class="text-sm text-text-muted"
    >
      Додайте гравців до гри
    </p>
  </div>
</template>
