<script setup lang="ts">
import type { Alignment, PlayerEntry, Profile, Role } from '~/types'
import {
  getRoleTypeLabel,
  getRoleTypeTagClass,
  getAlignmentForRoleType,
} from '~/composables/useRoleTypes'
import RoleAvatar from '~/components/games/RoleAvatar.vue'
import AlignmentTag from '~/components/games/AlignmentTag.vue'
import RolePickerPanel from '~/components/games/RolePickerPanel.vue'

const props = defineProps<{
  players: Profile[]
  roles: Role[]
  modelValue: PlayerEntry[]
}>()

const emit = defineEmits<{
  'update:modelValue': [entries: PlayerEntry[]]
}>()

// Track which players have the change section expanded
const expandedChanges = ref<Set<string>>(new Set())

// Track ending role picker visibility per player
const showEndingRolePicker = ref<Map<string, boolean>>(new Map())

function getRoleImage(roleId: string): string | null {
  return props.roles?.find(r => r.id === roleId)?.image_url
    ?? null
}

function getRoleType(roleId: string): string {
  return props.roles?.find(r => r.id === roleId)?.type ?? ''
}

function getAlignmentFromRoleType(type: string): 'good' | 'evil' {
  return getAlignmentForRoleType(type) ?? 'evil'
}

function getFinalRoleId(entry: PlayerEntry): string {
  return entry.ending_role_id ?? entry.starting_role_id
}

function getFinalRoleName(entry: PlayerEntry): string {
  return entry.ending_role_name ?? entry.role_name
}

function getFinalRoleImage(entry: PlayerEntry) {
  return getRoleImage(getFinalRoleId(entry))
}

function getFinalRoleType(entry: PlayerEntry): string {
  return getRoleType(getFinalRoleId(entry))
}

function getFinalAlignment(entry: PlayerEntry): Alignment | null {
  return entry.alignment_end ?? entry.alignment_start
}

function removePlayer(playerId: string) {
  expandedChanges.value.delete(playerId)
  showEndingRolePicker.value.delete(playerId)
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

function toggleChangeExpanded(playerId: string) {
  if (expandedChanges.value.has(playerId)) {
    expandedChanges.value.delete(playerId)
  }
  else {
    expandedChanges.value.add(playerId)
  }
}

function isChangeExpanded(playerId: string): boolean {
  return expandedChanges.value.has(playerId)
}

function hasEndingChange(entry: PlayerEntry): boolean {
  return entry.ending_role_id !== null || entry.alignment_end !== null
}

function selectEndingRole(playerId: string, role: Role) {
  const alignment = getAlignmentFromRoleType(role.type)
  emit(
    'update:modelValue',
    props.modelValue.map(e =>
      e.player_id === playerId
        ? {
            ...e,
            ending_role_id: role.id,
            ending_role_name: role.name_ua,
            alignment_end: alignment,
          }
        : e,
    ),
  )
  showEndingRolePicker.value.set(playerId, false)
}

function toggleEndingAlignment(playerId: string) {
  emit(
    'update:modelValue',
    props.modelValue.map((e) => {
      if (e.player_id !== playerId) return e
      const currentEnd = e.alignment_end ?? e.alignment_start
      return {
        ...e,
        alignment_end: currentEnd === 'good' ? 'evil' : 'good',
      }
    }),
  )
}

function clearEndingChange(playerId: string) {
  emit(
    'update:modelValue',
    props.modelValue.map(e =>
      e.player_id === playerId
        ? {
            ...e,
            ending_role_id: null,
            ending_role_name: null,
            alignment_end: null,
          }
        : e,
    ),
  )
  expandedChanges.value.delete(playerId)
  showEndingRolePicker.value.set(playerId, false)
}

function toggleEndingRolePicker(playerId: string) {
  const current = showEndingRolePicker.value.get(playerId) ?? false
  showEndingRolePicker.value.set(playerId, !current)
}

function isEndingRolePickerOpen(playerId: string): boolean {
  return showEndingRolePicker.value.get(playerId) ?? false
}
</script>

<template>
  <div data-testid="player-role-selector">
    <h3
      class="mb-4 font-heading text-xl font-semibold
        tracking-wide sm:text-2xl"
    >
      Гравці
    </h3>

    <!-- Players list -->
    <div
      v-if="modelValue.length"
      class="overflow-hidden rounded-xl
        border border-white/[0.06]"
    >
      <!-- Desktop table -->
      <table class="hidden w-full sm:table">
        <thead>
          <tr
            class="border-b border-white/[0.08]
              text-left"
          >
            <th
              class="px-6 py-4 text-sm font-semibold
                tracking-wide text-text-muted"
            >
              Гравець
            </th>
            <th
              class="px-6 py-4 text-sm font-semibold
                tracking-wide text-text-muted"
            >
              Роль
            </th>
            <th
              class="px-6 py-4 text-sm font-semibold
                tracking-wide text-text-muted"
            >
              Бік
            </th>
            <th
              class="px-6 py-4 text-sm font-semibold
                tracking-wide text-text-muted"
            >
              Живий
            </th>
            <th
              class="px-6 py-4 text-sm font-semibold
                tracking-wide text-text-muted"
            >
              MVP
            </th>
            <th class="px-6 py-4" />
          </tr>
        </thead>
        <tbody>
          <template
            v-for="entry in modelValue"
            :key="entry.player_id"
          >
            <!-- Main player row -->
            <tr
              class="border-b border-white/[0.04]
                transition-colors last:border-b-0
                hover:bg-white/[0.02]"
              :class="{
                'last:border-b-0': !isChangeExpanded(entry.player_id),
                '!border-b-0': isChangeExpanded(entry.player_id),
              }"
              data-testid="player-entry"
            >
              <td class="px-6 py-4">
                <span class="text-base font-semibold">
                  {{ entry.nickname }}
                </span>
              </td>
              <!-- Role — timeline -->
              <td class="px-6 py-4">
                <!-- No change -->
                <div
                  v-if="!hasEndingChange(entry)
                    || !entry.ending_role_id"
                  class="flex items-center gap-3"
                >
                  <RoleAvatar
                    :image-url="getRoleImage(entry.starting_role_id)"
                    :name="entry.role_name"
                    :type="getRoleType(entry.starting_role_id)"
                    size="lg"
                  />
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="text-base font-medium">
                        {{ entry.role_name }}
                      </span>
                      <Tag
                        :value="getRoleTypeLabel(
                          getRoleType(
                            entry.starting_role_id),
                        )"
                        :class="getRoleTypeTagClass(
                          getRoleType(
                            entry.starting_role_id),
                        )"
                        rounded
                        class="!px-2 !py-0.5 !text-xs"
                      />
                    </div>
                  </div>
                </div>
                <!-- Has change: timeline -->
                <div
                  v-else
                  class="flex items-center gap-3"
                >
                  <!-- Start (muted) -->
                  <div
                    class="flex shrink-0 items-center
                      gap-1.5 opacity-50"
                  >
                    <RoleAvatar
                      :image-url="getRoleImage(entry.starting_role_id)"
                      :name="entry.role_name"
                      :type="getRoleType(entry.starting_role_id)"
                      size="sm"
                    />
                    <span
                      class="max-w-20 truncate text-xs"
                    >
                      {{ entry.role_name }}
                    </span>
                  </div>
                  <i
                    class="pi pi-arrow-right shrink-0
                      text-xs text-text-subtle"
                  />
                  <!-- End (emphasized) -->
                  <div
                    class="flex min-w-0 items-center
                      gap-2"
                  >
                    <RoleAvatar
                      v-if="entry.ending_role_id"
                      :image-url="getRoleImage(entry.ending_role_id)"
                      :name="entry.ending_role_name ?? ''"
                      :type="getRoleType(entry.ending_role_id)"
                      size="md"
                    />
                    <div class="min-w-0">
                      <div
                        class="flex flex-wrap
                          items-center gap-1.5"
                      >
                        <span
                          class="text-sm font-semibold"
                        >
                          {{ entry.ending_role_name }}
                        </span>
                        <Tag
                          :value="getRoleTypeLabel(
                            getRoleType(
                              entry.ending_role_id!),
                          )"
                          :class="getRoleTypeTagClass(
                            getRoleType(
                              entry.ending_role_id!),
                          )"
                          rounded
                          class="!px-2 !py-0.5 !text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </td>
              <!-- Alignment — timeline -->
              <td class="px-6 py-4">
                <div
                  v-if="!entry.alignment_end
                    || entry.alignment_end
                      === entry.alignment_start"
                  class="flex items-center"
                >
                  <AlignmentTag
                    :alignment="entry.alignment_start"
                  />
                </div>
                <div
                  v-else
                  class="flex items-center gap-2"
                >
                  <AlignmentTag
                    :alignment="entry.alignment_start"
                    muted
                  />
                  <i
                    class="pi pi-arrow-right text-xs
                      text-text-subtle"
                  />
                  <AlignmentTag
                    :alignment="entry.alignment_end"
                  />
                </div>
              </td>
              <td class="px-6 py-4">
                <ToggleSwitch
                  :model-value="entry.is_alive"
                  @update:model-value="toggleAlive(
                    entry.player_id,
                  )"
                />
              </td>
              <td class="px-6 py-4">
                <ToggleSwitch
                  :model-value="entry.is_mvp"
                  @update:model-value="toggleMvp(
                    entry.player_id,
                  )"
                />
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-1">
                  <Button
                    v-tooltip.top="'Змінено роль?'"
                    :icon="isChangeExpanded(entry.player_id)
                      ? 'pi pi-chevron-up'
                      : 'pi pi-replay'"
                    :severity="hasEndingChange(entry) ? 'warn' : 'secondary'"
                    :text="!hasEndingChange(entry)"
                    :outlined="hasEndingChange(entry)"
                    size="small"
                    data-testid="toggle-change-btn"
                    @click="toggleChangeExpanded(entry.player_id)"
                  />
                  <Button
                    icon="pi pi-trash"
                    severity="danger"
                    text
                    @click="removePlayer(entry.player_id)"
                  />
                </div>
              </td>
            </tr>

            <!-- Ending role change row (desktop) -->
            <tr
              v-if="isChangeExpanded(entry.player_id)"
              :key="`${entry.player_id}-change`"
              class="border-b border-white/[0.04] last:border-b-0"
            >
              <td
                colspan="6"
                class="px-6 pb-4 pt-0"
              >
                <div
                  class="rounded-lg border border-white/[0.06]
                    bg-white/[0.02] p-4"
                  data-testid="ending-change-section"
                >
                  <div class="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-text-muted">
                    <i class="pi pi-replay text-[10px]" />
                    Зміна під час гри
                  </div>

                  <div class="grid gap-4 lg:grid-cols-[1fr_auto_auto]">
                    <!-- Ending role picker -->
                    <div class="flex flex-col gap-2">
                      <label class="text-xs font-medium text-text-muted">
                        Кінцева роль
                      </label>
                      <button
                        type="button"
                        class="flex min-h-[2.5rem] w-full cursor-pointer
                          items-center gap-2.5 rounded-lg border
                          border-white/[0.12] bg-white/[0.04] px-3
                          py-2 text-left transition-colors
                          hover:border-white/[0.2] hover:bg-white/[0.06]"
                        data-testid="ending-role-select"
                        @click="toggleEndingRolePicker(entry.player_id)"
                      >
                        <template v-if="entry.ending_role_id">
                          <RoleAvatar
                            :image-url="getRoleImage(entry.ending_role_id)"
                            :name="entry.ending_role_name ?? ''"
                            :type="getRoleType(entry.ending_role_id)"
                            size="sm"
                          />
                          <span class="flex-1 text-sm font-medium">
                            {{ entry.ending_role_name }}
                          </span>
                          <Tag
                            :value="getRoleTypeLabel(
                              getRoleType(entry.ending_role_id),
                            )"
                            :class="getRoleTypeTagClass(
                              getRoleType(entry.ending_role_id),
                            )"
                            rounded
                            class="!px-1.5 !py-0 !text-[10px]"
                          />
                        </template>
                        <template v-else>
                          <span class="flex-1 text-sm text-text-subtle">
                            Оберіть кінцеву роль
                          </span>
                        </template>
                        <i
                          class="pi pi-chevron-down text-xs text-text-subtle
                            transition-transform duration-200"
                          :class="{ 'rotate-180': isEndingRolePickerOpen(entry.player_id) }"
                        />
                      </button>

                      <!-- Ending role picker panel -->
                      <RolePickerPanel
                        v-if="isEndingRolePickerOpen(entry.player_id)"
                        :roles="roles"
                        :selected-id="entry.ending_role_id"
                        compact
                        @select="selectEndingRole(entry.player_id, $event)"
                      />
                    </div>

                    <!-- Ending alignment toggle -->
                    <div class="flex flex-col gap-2">
                      <label class="text-xs font-medium text-text-muted">
                        Кінцевий бік
                      </label>
                      <button
                        type="button"
                        class="flex min-h-[2.5rem] items-center gap-2
                          rounded-lg border border-white/[0.12]
                          bg-white/[0.04] px-3 py-2 transition-colors
                          hover:border-white/[0.2] hover:bg-white/[0.06]"
                        data-testid="ending-alignment-toggle"
                        @click="toggleEndingAlignment(entry.player_id)"
                      >
                        <AlignmentTag
                          :alignment="(entry.alignment_end ?? entry.alignment_start)"
                        />
                        <i class="pi pi-sync text-xs text-text-subtle" />
                      </button>
                    </div>

                    <!-- Clear change button -->
                    <div class="flex flex-col gap-2">
                      <label class="text-xs font-medium text-transparent">
                        Дія
                      </label>
                      <Button
                        icon="pi pi-times"
                        label="Скасувати зміну"
                        severity="secondary"
                        text
                        size="small"
                        data-testid="clear-change-btn"
                        @click="clearEndingChange(entry.player_id)"
                      />
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>

      <!-- Mobile cards -->
      <div class="flex flex-col divide-y divide-white/[0.04] sm:hidden">
        <div
          v-for="entry in modelValue"
          :key="entry.player_id"
          class="px-4 py-4"
          data-testid="player-entry"
        >
          <!-- Header: final role img + name + role/alignment -->
          <div class="flex items-center gap-3">
            <RoleAvatar
              :image-url="getFinalRoleImage(entry)"
              :name="getFinalRoleName(entry)"
              :type="getFinalRoleType(entry)"
              size="lg"
            />
            <div class="min-w-0 flex-1">
              <span class="font-semibold">
                {{ entry.nickname }}
              </span>
              <div
                class="mt-0.5 flex items-center gap-1.5"
              >
                <span class="text-sm text-text-muted">
                  {{ getFinalRoleName(entry) }}
                </span>
                <AlignmentTag
                  v-if="getFinalAlignment(entry)"
                  :alignment="getFinalAlignment(entry)!"
                  size="xs"
                />
              </div>
            </div>
            <button
              type="button"
              class="flex size-8 shrink-0 items-center
                justify-center rounded-lg
                text-red-400/70 transition-colors
                hover:bg-red-500/10 hover:text-red-400"
              @click="removePlayer(entry.player_id)"
            >
              <i class="pi pi-trash text-xs" />
            </button>
          </div>

          <!-- Timeline strip (matches GamePlayersTable) -->
          <div
            v-if="hasEndingChange(entry)"
            class="mt-4 flex items-center
              gap-2 rounded-lg bg-white/[0.03]
              px-3 py-2"
            data-testid="ending-change-indicator"
          >
            <!-- Role change -->
            <template
              v-if="entry.ending_role_id
                && entry.ending_role_name"
            >
              <div
                class="flex items-center gap-1.5
                  opacity-50"
              >
                <RoleAvatar
                  :image-url="getRoleImage(entry.starting_role_id)"
                  :name="entry.role_name"
                  :type="getRoleType(entry.starting_role_id)"
                  size="xs"
                />
                <span class="text-xs text-text-muted">
                  {{ entry.role_name }}
                </span>
              </div>
              <i
                class="pi pi-arrow-right shrink-0
                  text-[10px] text-text-subtle"
              />
              <div class="flex items-center gap-1.5">
                <RoleAvatar
                  :image-url="getRoleImage(entry.ending_role_id)"
                  :name="entry.ending_role_name"
                  :type="getRoleType(entry.ending_role_id)"
                  size="xs"
                />
                <span
                  class="text-xs font-medium text-text"
                >
                  {{ entry.ending_role_name }}
                </span>
              </div>
            </template>

            <!-- Alignment change -->
            <template
              v-if="entry.alignment_end
                && entry.alignment_end
                  !== entry.alignment_start"
            >
              <span
                v-if="entry.ending_role_id"
                class="mx-1 text-text-subtle"
              >
                ·
              </span>
              <AlignmentTag
                :alignment="entry.alignment_start"
                size="xs"
                muted
              />
              <i
                class="pi pi-arrow-right shrink-0
                  text-[10px] text-text-subtle"
              />
              <AlignmentTag
                :alignment="entry.alignment_end"
                size="xs"
              />
            </template>
          </div>

          <!-- Row 4: Controls row -->
          <div class="mt-8 flex items-center gap-5 border-t border-white/[0.04] pt-3 pl-[52px]">
            <label class="flex items-center gap-1.5 text-sm text-text-muted">
              <ToggleSwitch
                :model-value="entry.is_alive"
                @update:model-value="toggleAlive(entry.player_id)"
              />
              Живий
            </label>
            <label class="flex items-center gap-1.5 text-sm text-text-muted">
              <ToggleSwitch
                :model-value="entry.is_mvp"
                @update:model-value="toggleMvp(entry.player_id)"
              />
              MVP
            </label>
            <button
              type="button"
              class="ml-auto flex items-center gap-1 rounded-md
                px-2 py-1 text-xs transition-colors"
              :class="hasEndingChange(entry)
                ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                : 'text-text-subtle hover:bg-white/[0.06] hover:text-text-muted'"
              data-testid="toggle-change-btn"
              @click="toggleChangeExpanded(entry.player_id)"
            >
              <i class="pi pi-replay text-[10px]" />
              Змінено?
            </button>
          </div>

          <!-- Row 5 (expanded): Ending change section -->
          <div
            v-if="isChangeExpanded(entry.player_id)"
            class="mt-3 rounded-lg border border-white/[0.06]
              bg-white/[0.02] p-3"
            data-testid="ending-change-section"
          >
            <div class="mb-2.5 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-text-muted">
              <i class="pi pi-replay text-[9px]" />
              Зміна під час гри
            </div>

            <!-- Ending role picker -->
            <div class="mb-3 flex flex-col gap-1.5">
              <label class="text-xs font-medium text-text-muted">
                Кінцева роль
              </label>
              <button
                type="button"
                class="flex min-h-[2.5rem] w-full cursor-pointer
                  items-center gap-2 rounded-lg border
                  border-white/[0.12] bg-white/[0.04] px-3
                  py-2 text-left transition-colors
                  hover:border-white/[0.2] hover:bg-white/[0.06]"
                data-testid="ending-role-select"
                @click="toggleEndingRolePicker(entry.player_id)"
              >
                <template v-if="entry.ending_role_id">
                  <RoleAvatar
                    :image-url="getRoleImage(entry.ending_role_id)"
                    :name="entry.ending_role_name ?? ''"
                    :type="getRoleType(entry.ending_role_id)"
                    size="xs"
                  />
                  <span class="flex-1 truncate text-sm font-medium">
                    {{ entry.ending_role_name }}
                  </span>
                </template>
                <template v-else>
                  <span class="flex-1 text-sm text-text-subtle">
                    Оберіть кінцеву роль
                  </span>
                </template>
                <i
                  class="pi pi-chevron-down text-xs text-text-subtle
                    transition-transform duration-200"
                  :class="{ 'rotate-180': isEndingRolePickerOpen(entry.player_id) }"
                />
              </button>

              <!-- Mobile ending role picker panel -->
              <RolePickerPanel
                v-if="isEndingRolePickerOpen(entry.player_id)"
                :roles="roles"
                :selected-id="entry.ending_role_id"
                compact
                @select="selectEndingRole(entry.player_id, $event)"
              />
            </div>

            <!-- Ending alignment + clear -->
            <div class="flex items-end gap-3">
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-medium text-text-muted">
                  Кінцевий бік
                </label>
                <button
                  type="button"
                  class="flex items-center gap-2
                    rounded-lg border border-white/[0.12]
                    bg-white/[0.04] px-3 py-1.5 transition-colors
                    hover:border-white/[0.2] hover:bg-white/[0.06]"
                  data-testid="ending-alignment-toggle"
                  @click="toggleEndingAlignment(entry.player_id)"
                >
                  <AlignmentTag
                    :alignment="(entry.alignment_end ?? entry.alignment_start)"
                    size="xs"
                  />
                  <i class="pi pi-sync text-[10px] text-text-subtle" />
                </button>
              </div>

              <button
                type="button"
                class="flex items-center gap-1.5 rounded-md
                  px-2.5 py-1.5 text-xs text-text-muted transition-colors
                  hover:bg-white/[0.06] hover:text-text-subtle"
                data-testid="clear-change-btn"
                @click="clearEndingChange(entry.player_id)"
              >
                <i class="pi pi-times text-[10px]" />
                Скасувати
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-else
      class="rounded-xl border border-dashed
        border-white/[0.08] py-10 text-center"
    >
      <i
        class="pi pi-users mb-3 text-3xl
          text-text-subtle"
      />
      <p class="text-sm text-text-muted">
        Додайте гравців до гри
      </p>
    </div>
  </div>
</template>
