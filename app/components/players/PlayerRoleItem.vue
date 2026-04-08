<script setup lang="ts">
import type { RolePlayCount } from '~/types'
import {
  getRoleTypeTagClass,
  getRoleTypeLabel,
  getRoleTypeColor,
} from '~/composables/useRoleTypes'
import RoleAvatar from '~/components/games/RoleAvatar.vue'

defineProps<{
  role: RolePlayCount
  index: number
}>()

function getRankLabel(index: number): string | null {
  if (index <= 2) return String(index + 1)
  return null
}
</script>

<template>
  <div
    class="group flex items-center gap-3
      border-white/[0.04] hover:bg-white/[0.04]"
  >
    <div
      class="flex w-6 shrink-0 items-center
        justify-center"
    >
      <span
        v-if="getRankLabel(index)"
        class="text-xs font-bold"
        :class="index === 0
          ? 'text-accent' : 'text-text-subtle'"
      >
        #{{ getRankLabel(index) }}
      </span>
      <span
        v-else
        class="text-xs text-text-subtle/50"
      >
        {{ index + 1 }}
      </span>
    </div>
    <RoleAvatar
      :image-url="role.roleImageUrl"
      :name="role.roleName"
      :type="role.roleType"
      size="md"
    />
    <div class="min-w-0 flex-1">
      <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span class="truncate text-sm font-medium">
          {{ role.roleName }}
        </span>
        <Tag
          :value="getRoleTypeLabel(role.roleType)"
          :class="getRoleTypeTagClass(role.roleType)"
          rounded
          class="!w-auto shrink-0 !px-1.5 !py-0 !text-[9px]"
        />
      </div>
    </div>
    <div class="flex shrink-0 items-center gap-1">
      <span
        class="text-xl font-bold tabular-nums
          leading-none"
        :style="{
          color: getRoleTypeColor(role.roleType),
        }"
      >
        {{ role.count }}
      </span>
      <span class="text-xs text-text-subtle">
        {{ role.count === 1 ? 'гра' : 'ігор' }}
      </span>
    </div>
  </div>
</template>
