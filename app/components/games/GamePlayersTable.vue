<script setup lang="ts">
import type { GamePlayerWithDetails } from '~/composables/useGamePlayers'
import {
  getRoleTypeTagClass,
  getRoleTypeLabel,
} from '~/composables/useRoleTypes'
import RoleAvatar from '~/components/games/RoleAvatar.vue'
import AlignmentTag from '~/components/games/AlignmentTag.vue'
import PlayerAvatar
  from '~/components/players/PlayerAvatar.vue'

const props = defineProps<{
  players: GamePlayerWithDetails[]
  currentUserId?: string | null
  isAdmin?: boolean
}>()

const emit = defineEmits<{
  'edit-entry': [entry: GamePlayerWithDetails]
  'delete-entry': [entry: GamePlayerWithDetails]
}>()

function canEdit(entry: GamePlayerWithDetails): boolean {
  if (!props.currentUserId) return false
  if (props.isAdmin) return true
  return entry.player.id === props.currentUserId
}

function canDelete(_entry: GamePlayerWithDetails): boolean {
  return !!props.isAdmin
}

function hasRole(entry: GamePlayerWithDetails): boolean {
  return !!entry.starting_role
}

function hasRoleChange(entry: GamePlayerWithDetails): boolean {
  return !!(
    entry.starting_role
    && entry.ending_role
    && entry.ending_role.id !== entry.starting_role.id
  )
}

function hasAlignmentChange(entry: GamePlayerWithDetails): boolean {
  return !!(
    entry.alignment_end
    && entry.alignment_end !== entry.alignment_start
  )
}

function hasAnyChange(entry: GamePlayerWithDetails): boolean {
  return hasRoleChange(entry) || hasAlignmentChange(entry)
}

function finalRole(entry: GamePlayerWithDetails) {
  if (hasRoleChange(entry)) return entry.ending_role!
  return entry.starting_role
}

function finalAlignment(entry: GamePlayerWithDetails) {
  return hasAlignmentChange(entry)
    ? entry.alignment_end!
    : entry.alignment_start
}
</script>

<template>
  <div
    class="overflow-hidden rounded-xl
      border border-white/[0.06]"
    data-testid="game-players-table"
  >
    <!-- Desktop table -->
    <table class="hidden w-full sm:table">
      <thead>
        <tr class="border-b border-white/[0.08] text-left">
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
            Статус
          </th>
          <th
            v-if="currentUserId || isAdmin"
            class="px-6 py-4"
          />
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="entry in players"
          :key="entry.id"
          class="border-b border-white/[0.04]
            transition-colors duration-150
            last:border-b-0 hover:bg-white/[0.02]"
          data-testid="player-row"
        >
          <!-- Player -->
          <td class="px-6 py-4">
            <div class="flex items-center gap-3">
              <PlayerAvatar
                :avatar-url="entry.player.avatar_url"
                :nickname="entry.player.nickname"
              />
              <div>
                <NuxtLink
                  :to="`/players/${entry.player.id}`"
                  class="text-base font-semibold
                    hover:text-primary transition-colors"
                >
                  {{ entry.player.nickname }}
                </NuxtLink>
                <Tag
                  v-if="entry.is_mvp"
                  value="MVP"
                  severity="warn"
                  rounded
                  class="ml-2 !px-2 !py-0.5 !text-xs"
                  data-testid="mvp-badge"
                />
              </div>
            </div>
          </td>

          <!-- Role — timeline layout -->
          <td class="px-6 py-4">
            <!-- No role assigned -->
            <span
              v-if="!hasRole(entry)"
              class="text-sm text-text-subtle"
            >
              Не вказано
            </span>

            <!-- No change: single role display -->
            <div
              v-else-if="!hasRoleChange(entry)"
              class="flex items-center gap-2"
            >
              <RoleAvatar
                :image-url="finalRole(entry)!.image_url"
                :name="finalRole(entry)!.name_ua"
                :type="finalRole(entry)!.type"
                size="lg"
                class="!size-12"
              />
              <div class="flex flex-col items-start gap-1">
                <span class="ml-1 text-base font-semibold">
                  {{ finalRole(entry)!.name_ua }}
                </span>
                <Tag
                  :value="getRoleTypeLabel(
                    finalRole(entry)!.type,
                  )"
                  :class="getRoleTypeTagClass(
                    finalRole(entry)!.type,
                  )"
                  rounded
                  class="!px-2 !py-0.25 !text-[10px]"
                />
              </div>
            </div>

            <!-- Has change: timeline Start -> End -->
            <div
              v-else
              class="flex items-center gap-3"
            >
              <!-- Start role (muted, compact) -->
              <div
                class="flex shrink-0 items-center
                  gap-1.5 opacity-50"
              >
                <RoleAvatar
                  :image-url="entry.starting_role!.image_url"
                  :name="entry.starting_role!.name_ua"
                  :type="entry.starting_role!.type"
                  size="md"
                />
                <span class="max-w-24 truncate text-xs">
                  {{ entry.starting_role!.name_ua }}
                </span>
              </div>

              <!-- Arrow -->
              <i
                class="pi pi-arrow-right shrink-0 text-xs
                  text-text-subtle"
              />

              <!-- End role (emphasized) -->
              <div class="flex items-center gap-2">
                <RoleAvatar
                  :image-url="finalRole(entry)!.image_url"
                  :name="finalRole(entry)!.name_ua"
                  :type="finalRole(entry)!.type"
                  size="lg"
                  class="!size-12"
                />
                <div class="flex flex-col items-start gap-1">
                  <span class="ml-1 text-base font-semibold">
                    {{ finalRole(entry)!.name_ua }}
                  </span>
                  <Tag
                    :value="getRoleTypeLabel(
                      finalRole(entry)!.type,
                    )"
                    :class="getRoleTypeTagClass(
                      finalRole(entry)!.type,
                    )"
                    rounded
                    class="!px-2 !py-0.25 !text-[10px]"
                  />
                </div>
              </div>
            </div>
          </td>

          <!-- Alignment — timeline layout -->
          <td class="px-6 py-4">
            <!-- No alignment -->
            <span
              v-if="!entry.alignment_start"
              class="text-sm text-text-subtle"
            >
              —
            </span>

            <!-- No change: single alignment -->
            <div
              v-else-if="!hasAlignmentChange(entry)"
              class="flex items-center gap-2"
            >
              <AlignmentTag :alignment="finalAlignment(entry)!" />
            </div>

            <!-- Has change: timeline Start -> End -->
            <div
              v-else
              class="flex items-center gap-2"
            >
              <AlignmentTag
                :alignment="entry.alignment_start!"
                muted
              />
              <i
                class="pi pi-arrow-right text-xs
                  text-text-subtle"
              />
              <AlignmentTag :alignment="finalAlignment(entry)!" />
            </div>
          </td>

          <!-- Status -->
          <td class="px-6 py-4">
            <div class="flex items-center gap-2">
              <span
                class="inline-block size-2.5 rounded-full"
                :class="[
                  entry.is_alive
                    ? 'bg-alive'
                    : 'bg-dead',
                ]"
              />
              <span
                class="text-sm"
                :class="[
                  entry.is_alive
                    ? 'text-text'
                    : 'text-text-muted',
                ]"
              >
                {{ entry.is_alive ? 'Живий' : 'Мертвий' }}
              </span>
            </div>
          </td>

          <!-- Actions -->
          <td
            v-if="currentUserId || isAdmin"
            class="px-6 py-4"
          >
            <div class="flex items-center justify-end gap-1">
              <Button
                v-if="canEdit(entry)"
                v-tooltip="'Редагувати'"
                icon="pi pi-pencil"
                severity="secondary"
                text
                rounded
                @click="emit('edit-entry', entry)"
              />
              <Button
                v-if="canDelete(entry)"
                v-tooltip="'Видалити'"
                icon="pi pi-trash"
                severity="secondary"
                text
                rounded
                @click="emit('delete-entry', entry)"
              />
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Mobile card layout -->
    <div
      class="flex flex-col divide-y
        divide-white/[0.04] sm:hidden"
    >
      <div
        v-for="entry in players"
        :key="entry.id"
        class="px-4 py-4"
        data-testid="player-row"
      >
        <!-- Player header -->
        <div class="flex items-center gap-3">
          <RoleAvatar
            v-if="hasRole(entry)"
            :image-url="finalRole(entry)!.image_url"
            :name="finalRole(entry)!.name_ua"
            :type="finalRole(entry)!.type"
            size="lg"
          />
          <PlayerAvatar
            v-else
            :avatar-url="null"
            :nickname="entry.player.nickname"
          />

          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2">
              <NuxtLink
                :to="`/players/${entry.player.id}`"
                class="font-semibold
                  hover:text-primary transition-colors"
              >
                {{ entry.player.nickname }}
              </NuxtLink>
              <Tag
                v-if="entry.is_mvp"
                value="MVP"
                severity="warn"
                rounded
                class="!px-1.5 !py-0 !text-[10px]"
                data-testid="mvp-badge"
              />
            </div>
            <div
              v-if="hasRole(entry)"
              class="mt-0.5 flex items-center gap-1.5"
            >
              <span class="text-sm text-text-muted">
                {{ finalRole(entry)!.name_ua }}
              </span>
              <Tag
                :value="getRoleTypeLabel(
                  finalRole(entry)!.type,
                )"
                :class="getRoleTypeTagClass(
                  finalRole(entry)!.type,
                )"
                rounded
                class="!px-1.5 !py-0 !text-[9px]"
              />
            </div>
            <span
              v-else
              class="mt-0.5 text-sm text-text-subtle"
            >
              Роль не вказано
            </span>
          </div>

          <!-- Status dot -->
          <span
            class="inline-block size-2.5 shrink-0
              rounded-full"
            :class="[
              entry.is_alive
                ? 'bg-alive'
                : 'bg-dead',
            ]"
            :title="entry.is_alive
              ? 'Живий' : 'Мертвий'"
          />

          <!-- Actions -->
          <div class="flex shrink-0 items-center gap-0.5">
            <Button
              v-if="canEdit(entry)"
              icon="pi pi-pencil"
              severity="secondary"
              text
              rounded
              size="small"
              @click="emit('edit-entry', entry)"
            />
            <Button
              v-if="canDelete(entry)"
              icon="pi pi-trash"
              severity="secondary"
              text
              rounded
              size="small"
              @click="emit('delete-entry', entry)"
            />
          </div>
        </div>

        <!-- Timeline strip (only when changes) -->
        <div
          v-if="hasAnyChange(entry)"
          class="mt-4 flex items-center
            gap-2 rounded-lg bg-white/[0.03]
            px-3 py-2"
        >
          <!-- Role change -->
          <template v-if="hasRoleChange(entry)">
            <div
              class="flex items-center gap-1.5
                opacity-50"
            >
              <RoleAvatar
                :image-url="entry.starting_role!.image_url"
                :name="entry.starting_role!.name_ua"
                :type="entry.starting_role!.type"
                size="xs"
              />
              <span class="text-xs text-text-muted">
                {{ entry.starting_role!.name_ua }}
              </span>
            </div>
            <i
              class="pi pi-arrow-right shrink-0
                text-[10px] text-text-subtle"
            />
            <div class="flex items-center gap-1.5">
              <RoleAvatar
                :image-url="finalRole(entry)!.image_url"
                :name="finalRole(entry)!.name_ua"
                :type="finalRole(entry)!.type"
                size="xs"
              />
              <span
                class="text-xs font-medium text-text"
              >
                {{ finalRole(entry)!.name_ua }}
              </span>
            </div>
          </template>

          <!-- Alignment change (separate or only) -->
          <template v-if="hasAlignmentChange(entry)">
            <span
              v-if="hasRoleChange(entry)"
              class="mx-1 text-text-subtle"
            >
              ·
            </span>
            <AlignmentTag
              :alignment="entry.alignment_start!"
              size="xs"
              muted
            />
            <i
              class="pi pi-arrow-right shrink-0
                text-[10px] text-text-subtle"
            />
            <AlignmentTag
              :alignment="finalAlignment(entry)!"
              size="xs"
            />
          </template>
        </div>
      </div>
    </div>

    <div
      v-if="!players.length"
      class="py-12 text-center text-text-muted"
    >
      <i
        class="pi pi-users mb-2 text-text-subtle"
        style="font-size: 3.5rem"
      />
      <p>Немає гравців</p>
    </div>
  </div>
</template>
