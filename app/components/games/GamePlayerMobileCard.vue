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
  hasAnyChange,
  finalRole,
  finalAlignment,
} from '~/utils/gamePlayer'
import RoleAvatar from '~/components/games/RoleAvatar.vue'
import AlignmentTag from '~/components/games/AlignmentTag.vue'
import PlayerAvatar
  from '~/components/players/PlayerAvatar.vue'

defineProps<{
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
</script>

<template>
  <div
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
        :avatar-url="entry.player.avatar_url"
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
        v-if="entry.is_alive != null"
        class="inline-block size-2.5 shrink-0
          rounded-full"
        :class="entry.is_alive
          ? 'bg-alive' : 'bg-dead'"
        :title="entry.is_alive
          ? 'Живий' : 'Мертвий'"
      />

      <!-- W/L badge -->
      <span
        v-if="winner && didWin(entry, winner) !== null"
        class="inline-flex w-7 shrink-0
          items-center justify-center
          rounded-full py-0.5
          text-[10px] font-semibold"
        :class="didWin(entry, winner)
          ? 'bg-win/10 text-win'
          : 'bg-white/[0.04] text-text-muted'"
      >
        {{ didWin(entry, winner) ? 'W' : 'L' }}
      </span>

      <!-- Actions -->
      <div class="flex shrink-0 items-center gap-0.5">
        <Button
          v-if="canEdit(entry, currentUserId ?? null, !!isAdmin, gameStatus ?? 'upcoming')"
          icon="pi pi-pencil"
          severity="secondary"
          text
          rounded
          size="small"
          @click="emit('edit-entry', entry)"
        />
        <Button
          v-if="canDelete(entry, currentUserId ?? null, !!isAdmin, gameStatus ?? 'upcoming')"
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
</template>
