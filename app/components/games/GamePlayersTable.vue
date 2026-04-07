<script setup lang="ts">
import type { GamePlayerWithDetails } from '~/composables/useGamePlayers'
import {
  getRoleTypeTagClass,
  getRoleTypeInfo,
} from '~/composables/useRoleTypes'

defineProps<{
  players: GamePlayerWithDetails[]
}>()
</script>

<template>
  <div
    class="overflow-hidden rounded-lg
      border border-white/[0.06]"
    data-testid="game-players-table"
  >
    <table class="w-full text-sm">
      <thead>
        <tr class="border-b border-white/[0.06] text-left">
          <th class="px-4 py-3 font-medium text-text-muted">
            Гравець
          </th>
          <th class="px-4 py-3 font-medium text-text-muted">
            Роль
          </th>
          <th
            class="hidden px-4 py-3 font-medium
              text-text-muted sm:table-cell"
          >
            Бік
          </th>
          <th class="px-4 py-3 font-medium text-text-muted">
            Статус
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="entry in players"
          :key="entry.id"
          class="border-b border-white/[0.04]
            last:border-b-0"
          data-testid="player-row"
        >
          <td class="px-4 py-3">
            <div class="flex items-center gap-2">
              <Avatar
                v-if="entry.player.avatar_url"
                :image="entry.player.avatar_url"
                :pt="{
                  image: { referrerpolicy: 'no-referrer' },
                }"
                shape="circle"
                class="!h-7 !w-7"
              />
              <Avatar
                v-else
                :label="entry.player.nickname
                  .slice(0, 2).toUpperCase()"
                shape="circle"
                class="!h-7 !w-7 !text-xs"
              />
              <span class="font-medium">
                {{ entry.player.nickname }}
              </span>
              <Tag
                v-if="entry.is_mvp"
                value="MVP"
                severity="warn"
                rounded
                class="!px-1.5 !py-0 !text-[10px]"
                data-testid="mvp-badge"
              />
            </div>
          </td>
          <td class="px-4 py-3">
            <div class="flex items-center gap-2">
              <img
                v-if="entry.starting_role.image_url"
                :src="entry.starting_role.image_url"
                :alt="entry.starting_role.name_en"
                class="size-6 rounded-full object-cover"
                loading="lazy"
              >
              <span>
                {{ entry.starting_role.name_ua }}
              </span>
              <Tag
                :value="getRoleTypeInfo(
                  entry.starting_role.type,
                )?.label ?? entry.starting_role.type"
                :class="getRoleTypeTagClass(
                  entry.starting_role.type,
                )"
                rounded
                class="!px-1.5 !py-0 !text-[10px]"
              />
            </div>
            <div
              v-if="entry.ending_role
                && entry.ending_role.id
                  !== entry.starting_role.id"
              class="mt-1 flex items-center gap-1
                text-xs text-text-muted"
            >
              <i class="pi pi-arrow-right text-[10px]" />
              {{ entry.ending_role.name_ua }}
            </div>
          </td>
          <td
            class="hidden px-4 py-3 sm:table-cell"
          >
            <Tag
              :value="entry.alignment_start === 'good'
                ? 'Добро' : 'Зло'"
              :severity="entry.alignment_start === 'good'
                ? 'success' : 'danger'"
              rounded
              class="!px-1.5 !py-0 !text-[10px]"
            />
            <span
              v-if="entry.alignment_end
                && entry.alignment_end
                  !== entry.alignment_start"
              class="ml-1 inline-flex items-center gap-1
                text-xs text-text-muted"
            >
              <i class="pi pi-arrow-right text-[10px]" />
              <Tag
                :value="entry.alignment_end === 'good'
                  ? 'Добро' : 'Зло'"
                :severity="entry.alignment_end === 'good'
                  ? 'success' : 'danger'"
                rounded
                class="!px-1.5 !py-0 !text-[10px]"
              />
            </span>
          </td>
          <td class="px-4 py-3">
            <Tag
              :value="entry.is_alive ? 'Живий' : 'Мертвий'"
              :severity="entry.is_alive
                ? 'success' : 'secondary'"
              rounded
              class="!px-1.5 !py-0 !text-[10px]"
            />
          </td>
        </tr>
      </tbody>
    </table>

    <div
      v-if="!players.length"
      class="py-8 text-center text-text-muted"
    >
      Немає гравців
    </div>
  </div>
</template>
