<script setup lang="ts">
import type { GamePlayerWithDetails } from '~/composables/useGamePlayers'
import {
  getRoleTypeTagClass,
  getRoleTypeInfo,
} from '~/composables/useRoleTypes'
import RoleAvatar from '~/components/games/RoleAvatar.vue'
import AlignmentTag from '~/components/games/AlignmentTag.vue'

defineProps<{
  players: GamePlayerWithDetails[]
}>()

function hasRoleChange(entry: GamePlayerWithDetails): boolean {
  return !!(
    entry.ending_role
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
  return hasRoleChange(entry) ? entry.ending_role! : entry.starting_role
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
              <Avatar
                v-if="entry.player.avatar_url"
                :image="entry.player.avatar_url"
                :pt="{
                  image: { referrerpolicy: 'no-referrer' },
                }"
                shape="circle"
                class="!h-10 !w-10"
              />
              <Avatar
                v-else
                :label="entry.player.nickname
                  .slice(0, 2).toUpperCase()"
                shape="circle"
                class="!h-10 !w-10 !text-sm"
              />
              <div>
                <span class="text-base font-semibold">
                  {{ entry.player.nickname }}
                </span>
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
            <!-- No change: single role display -->
            <div
              v-if="!hasRoleChange(entry)"
              class="flex items-center gap-3"
            >
              <RoleAvatar
                :image-url="finalRole(entry).image_url"
                :name="finalRole(entry).name_ua"
                :type="finalRole(entry).type"
                size="lg"
              />
              <div>
                <div class="flex items-center gap-2">
                  <span class="text-base font-medium">
                    {{ finalRole(entry).name_ua }}
                  </span>
                  <Tag
                    :value="getRoleTypeInfo(
                      finalRole(entry).type,
                    )?.label ?? finalRole(entry).type"
                    :class="getRoleTypeTagClass(
                      finalRole(entry).type,
                    )"
                    rounded
                    class="!px-2 !py-0.5 !text-xs"
                  />
                </div>
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
                  :image-url="entry.starting_role.image_url"
                  :name="entry.starting_role.name_ua"
                  :type="entry.starting_role.type"
                  size="sm"
                />
                <span class="max-w-24 truncate text-xs">
                  {{ entry.starting_role.name_ua }}
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
                  :image-url="finalRole(entry).image_url"
                  :name="finalRole(entry).name_ua"
                  :type="finalRole(entry).type"
                  size="lg"
                />
                <div>
                  <div class="flex items-center gap-2">
                    <span class="text-base font-semibold">
                      {{ finalRole(entry).name_ua }}
                    </span>
                    <Tag
                      :value="getRoleTypeInfo(
                        finalRole(entry).type,
                      )?.label ?? finalRole(entry).type"
                      :class="getRoleTypeTagClass(
                        finalRole(entry).type,
                      )"
                      rounded
                      class="!px-2 !py-0.5 !text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          </td>

          <!-- Alignment — timeline layout -->
          <td class="px-6 py-4">
            <!-- No change: single alignment -->
            <div
              v-if="!hasAlignmentChange(entry)"
              class="flex items-center gap-2"
            >
              <AlignmentTag :alignment="finalAlignment(entry)" />
            </div>

            <!-- Has change: timeline Start -> End -->
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
              <AlignmentTag :alignment="finalAlignment(entry)" />
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
            :image-url="finalRole(entry).image_url"
            :name="finalRole(entry).name_ua"
            :type="finalRole(entry).type"
            size="lg"
          />

          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2">
              <span class="font-semibold">
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
            <div
              class="mt-0.5 flex items-center gap-1.5"
            >
              <span class="text-sm text-text-muted">
                {{ finalRole(entry).name_ua }}
              </span>
              <AlignmentTag
                :alignment="finalAlignment(entry)"
                size="xs"
              />
            </div>
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
        </div>

        <!-- Timeline strip (only when changes) -->
        <div
          v-if="hasAnyChange(entry)"
          class="mt-2 flex items-center
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
                :image-url="entry.starting_role.image_url"
                :name="entry.starting_role.name_ua"
                :type="entry.starting_role.type"
                size="xs"
              />
              <span class="text-xs text-text-muted">
                {{ entry.starting_role.name_ua }}
              </span>
            </div>
            <i
              class="pi pi-arrow-right shrink-0
                text-[10px] text-text-subtle"
            />
            <div class="flex items-center gap-1.5">
              <RoleAvatar
                :image-url="finalRole(entry).image_url"
                :name="finalRole(entry).name_ua"
                :type="finalRole(entry).type"
                size="xs"
              />
              <span
                class="text-xs font-medium text-text"
              >
                {{ finalRole(entry).name_ua }}
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
              :alignment="entry.alignment_start"
              size="xs"
              muted
            />
            <i
              class="pi pi-arrow-right shrink-0
                text-[10px] text-text-subtle"
            />
            <AlignmentTag
              :alignment="finalAlignment(entry)"
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
      <i class="pi pi-users mb-2 text-3xl text-text-subtle" />
      <p>Немає гравців</p>
    </div>
  </div>
</template>
