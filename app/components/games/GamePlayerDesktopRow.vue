<script setup lang="ts">
import type { GamePlayerWithDetails } from '~/composables/useGamePlayers'
import {
  getRoleTypeTagClass,
  getRoleTypeLabel,
} from '~/composables/useRoleTypes'
import {
  didWin,
  canEdit,
  canDelete,
  hasRole,
  hasRoleChange,
  hasAlignmentChange,
  finalRole,
  finalAlignment,
  entryPoints,
} from '~/utils/gamePlayer'
import RoleAvatar from '~/components/games/RoleAvatar.vue'
import AlignmentTag from '~/components/games/AlignmentTag.vue'
import PlayerAvatar
  from '~/components/players/PlayerAvatar.vue'

const props = defineProps<{
  entry: GamePlayerWithDetails
  currentUserId?: string | null
  isAdmin?: boolean
  winner?: 'good' | 'evil' | null
  gameStatus?: string
}>()

const emit = defineEmits<{
  'edit-entry': [entry: GamePlayerWithDetails]
  'delete-entry': [entry: GamePlayerWithDetails]
}>()

const isFinished = computed(
  () => props.gameStatus === 'finished',
)
</script>

<template>
  <tr
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
          class="pi pi-arrow-right shrink-0
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
      <span
        v-if="!entry.alignment_start"
        class="text-sm text-text-subtle"
      >
        —
      </span>
      <div
        v-else-if="!hasAlignmentChange(entry)"
        class="flex items-center gap-2"
      >
        <AlignmentTag :alignment="finalAlignment(entry)!" />
      </div>
      <div
        v-else
        class="flex items-center gap-2"
      >
        <AlignmentTag
          :alignment="entry.alignment_start!"
          size="xs"
          muted
        />
        <i
          class="pi pi-arrow-right
            text-text-subtle"
        />
        <AlignmentTag :alignment="finalAlignment(entry)!" />
      </div>
    </td>

    <!-- Status -->
    <td class="px-6 py-4">
      <div
        v-if="entry.is_alive != null"
        class="flex items-center gap-2"
      >
        <span
          class="inline-block size-2.5 rounded-full"
          :class="entry.is_alive
            ? 'bg-alive' : 'bg-dead'"
        />
        <span
          class="text-sm"
          :class="entry.is_alive
            ? 'text-text' : 'text-text-muted'"
        >
          {{ entry.is_alive ? 'Живий' : 'Мертвий' }}
        </span>
      </div>
      <span
        v-else
        class="text-sm text-text-subtle"
      >
        —
      </span>
    </td>

    <!-- W/L -->
    <td
      v-if="winner"
      class="px-6 py-4"
    >
      <span
        v-if="didWin(entry, winner) !== null"
        class="inline-flex w-7 items-center
          justify-center rounded-full py-0.5
          text-[10px] font-semibold"
        :class="didWin(entry, winner)
          ? 'bg-win/10 text-win'
          : 'bg-white/[0.04] text-text-muted'"
      >
        {{ didWin(entry, winner) ? 'W' : 'L' }}
      </span>
    </td>

    <!-- Points -->
    <td
      v-if="isFinished"
      class="px-6 py-4"
    >
      <span
        class="text-sm font-semibold"
        :class="entryPoints(entry, winner ?? null)
          ? 'text-accent' : 'text-text-subtle'"
      >
        {{ entryPoints(entry, winner ?? null) || '–' }}
      </span>
    </td>

    <!-- Actions -->
    <td
      v-if="currentUserId || isAdmin"
      class="px-6 py-4"
    >
      <div class="flex items-center justify-end gap-1">
        <Button
          v-if="canEdit(entry, currentUserId ?? null, !!isAdmin, gameStatus ?? 'upcoming')"
          v-tooltip="'Редагувати'"
          icon="pi pi-pencil"
          severity="secondary"
          text
          rounded
          @click="emit('edit-entry', entry)"
        />
        <Button
          v-if="canDelete(entry, currentUserId ?? null, !!isAdmin, gameStatus ?? 'upcoming')"
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
</template>
