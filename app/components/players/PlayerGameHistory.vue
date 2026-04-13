<script setup lang="ts">
import type { PlayerGameHistory } from '#shared/types'
import { formatDate, formatDateShort } from '~/utils/date'
import {
  getScriptLabel,
  getWinnerInfo,
} from '~/composables/useGameLabels'
import {
  getRoleTypeTagClass,
  getRoleTypeLabel,
} from '~/composables/useRoleTypes'
import { gamePoints as calcGamePoints } from '~/utils/stats'
import RoleAvatar from '~/components/games/RoleAvatar.vue'
import AlignmentTag from '~/components/games/AlignmentTag.vue'

defineProps<{
  games: PlayerGameHistory[]
}>()

function gamePoints(game: PlayerGameHistory): number {
  return calcGamePoints(
    game.won,
    game.endingRoleType,
    game.roleType,
  )
}
</script>

<template>
  <div class="relative overflow-hidden">
    <div class="p-5 sm:p-6">
      <div class="flex items-center justify-between">
        <h3 class="font-heading text-lg font-semibold">
          Історія ігор
        </h3>
        <span
          v-if="games.length > 0"
          class="text-xs text-text-muted"
        >
          {{ games.length }} {{ games.length === 1 ? 'гра' : 'ігор' }}
        </span>
      </div>
    </div>

    <div v-if="!games.length" class="px-5 pb-8 text-center">
      <div
        class="mx-auto flex size-16 items-center
          justify-center rounded-full
          bg-white/[0.03]"
      >
        <i
          class="pi pi-list text-text-subtle"
        />
      </div>
      <p class="mt-3 text-sm text-text-muted">
        Гравець ще не брав участі в іграх
      </p>
    </div>

    <!-- Desktop table -->
    <div v-else>
      <table class="hidden w-full lg:table">
        <thead>
          <tr class="border-b border-white/[0.08] text-left">
            <th
              class="px-6 py-3 text-xs font-semibold
                uppercase tracking-wider text-text-muted"
            >
              Дата
            </th>
            <th
              class="px-6 py-3 text-xs font-semibold
                uppercase tracking-wider text-text-muted"
            >
              Сценарій
            </th>
            <th
              class="px-6 py-3 text-xs font-semibold
                uppercase tracking-wider text-text-muted"
            >
              Роль
            </th>
            <th
              class="px-6 py-3 text-xs font-semibold
                uppercase tracking-wider text-text-muted"
            >
              Бік
            </th>
            <th
              class="px-6 py-3 text-xs font-semibold
                uppercase tracking-wider text-text-muted"
            >
              Бали
            </th>
            <th
              class="px-6 py-3 text-xs font-semibold
                uppercase tracking-wider text-text-muted"
            >
              Статус
            </th>
            <th
              class="px-6 py-3 text-xs font-semibold
                uppercase tracking-wider text-text-muted"
            >
              Результат
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="game in games"
            :key="game.gameId"
            class="border-b border-white/[0.04]
              transition-colors duration-150
              last:border-b-0 hover:bg-white/[0.03]"
          >
            <!-- Date -->
            <td class="px-6 py-3.5">
              <NuxtLink
                :to="`/games/${game.gameId}`"
                class="text-sm text-text-muted
                  transition-colors hover:text-primary"
              >
                {{ formatDate(game.date) }}
              </NuxtLink>
            </td>

            <!-- Script -->
            <td class="px-6 py-3.5">
              <span class="text-sm">
                {{ getScriptLabel(game.script) }}
              </span>
            </td>

            <!-- Role — with timeline for changes -->
            <td class="px-6 py-3.5">
              <!-- No role change: single role -->
              <div
                v-if="!game.hasRoleChange"
                class="flex items-center gap-2.5"
              >
                <RoleAvatar
                  :image-url="game.roleImageUrl"
                  :name="game.roleName"
                  :type="game.roleType"
                  size="md"
                />
                <div class="flex flex-col items-start gap-0.5">
                  <span
                    class="ml-1 flex items-center gap-1
                      text-sm font-medium"
                  >
                    {{ game.roleName }}
                    <i
                      v-if="game.isMvp"
                      class="pi pi-star-fill text-accent
                        text-[10px]"
                    />
                  </span>
                  <Tag
                    :value="getRoleTypeLabel(game.roleType)"
                    :class="getRoleTypeTagClass(game.roleType)"
                    rounded
                    class="!w-auto !px-1.5 !py-0 !text-[9px]"
                  />
                </div>
              </div>

              <!-- Has role change: timeline Start -> End -->
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
                    :image-url="game.startingRoleImageUrl"
                    :name="game.startingRoleName || ''"
                    :type="game.startingRoleType || 'townsfolk'"
                    size="sm"
                  />
                  <span class="max-w-20 truncate text-xs">
                    {{ game.startingRoleName }}
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
                    :image-url="game.endingRoleImageUrl"
                    :name="game.endingRoleName || game.roleName"
                    :type="game.endingRoleType || game.roleType"
                    size="md"
                  />
                  <div class="flex flex-col items-start gap-0.5">
                    <span
                      class="flex items-center gap-1
                        text-sm font-medium"
                    >
                      {{ game.endingRoleName || game.roleName }}
                      <i
                        v-if="game.isMvp"
                        class="pi pi-star-fill text-accent
                          text-[10px]"
                      />
                    </span>
                    <Tag
                      :value="getRoleTypeLabel(game.endingRoleType || game.roleType)"
                      :class="getRoleTypeTagClass(game.endingRoleType || game.roleType)"
                      rounded
                      class="!w-auto !px-1.5 !py-0 !text-[9px]"
                    />
                  </div>
                </div>
              </div>
            </td>

            <!-- Alignment — with timeline for changes -->
            <td class="px-6 py-3.5">
              <!-- No alignment -->
              <span
                v-if="!game.alignment"
                class="text-sm text-text-subtle"
              >
                —
              </span>

              <!-- No change: single alignment -->
              <div
                v-else-if="!game.hasAlignmentChange"
                class="flex items-center gap-2"
              >
                <AlignmentTag :alignment="game.alignment" />
              </div>

              <!-- Has change: timeline Start -> End -->
              <div
                v-else
                class="flex items-center gap-2"
              >
                <AlignmentTag
                  :alignment="game.alignmentStart!"
                  size="xs"
                  muted
                />
                <i
                  class="pi pi-arrow-right
                    text-text-subtle"
                />
                <AlignmentTag
                  :alignment="game.alignmentEnd!"
                />
              </div>
            </td>

            <!-- Points -->
            <td class="px-6 py-3.5">
              <span
                class="text-sm font-semibold"
                :class="gamePoints(game)
                  ? 'text-accent' : 'text-text-subtle'"
              >
                {{ gamePoints(game) || '–' }}
              </span>
            </td>

            <!-- Status -->
            <td class="px-6 py-3.5">
              <div
                v-if="game.isAlive != null"
                class="flex items-center gap-2"
              >
                <span
                  class="inline-block size-2.5 rounded-full"
                  :class="game.isAlive
                    ? 'bg-traveller' : 'bg-dead'"
                />
                <span
                  class="text-sm"
                  :class="game.isAlive
                    ? 'text-text' : 'text-text-muted'"
                >
                  {{ game.isAlive ? 'Живий' : 'Мертвий' }}
                </span>
              </div>
              <span
                v-else
                class="text-sm text-text-subtle"
              >
                —
              </span>
            </td>

            <!-- Result -->
            <td class="px-6 py-3.5">
              <span
                class="inline-flex items-center gap-1.5
                  rounded-full px-2.5 py-1 text-xs
                  font-medium"
                :class="game.won
                  ? 'bg-win/10 text-win ring-1 ring-win/20'
                  : 'bg-white/[0.04] text-text-muted ring-1 ring-white/[0.06]'"
              >
                <i
                  :class="getWinnerInfo(game.winner)?.icon"
                  class="text-[10px]"
                />
                {{ game.won ? 'Перемога' : 'Поразка' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Mobile/Tablet cards -->
      <div class="flex flex-col divide-y divide-white/[0.04] lg:hidden">
        <NuxtLink
          v-for="game in games"
          :key="game.gameId"
          :to="`/games/${game.gameId}`"
          class="block px-5 py-4
            transition-colors hover:bg-white/[0.02]"
        >
          <!-- Top row: role + result -->
          <div class="flex items-center gap-3">
            <RoleAvatar
              :image-url="game.roleImageUrl"
              :name="game.roleName"
              :type="game.roleType"
              size="md"
            />

            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-1.5">
                <span class="truncate text-sm font-semibold">
                  {{ game.roleName }}
                </span>
                <i
                  v-if="game.isMvp"
                  class="pi pi-star-fill text-accent
                    shrink-0"
                />
              </div>
              <div class="mt-0.5 flex items-center gap-2 text-xs text-text-muted">
                <span>{{ formatDateShort(game.date) }}</span>
                <span class="text-white/[0.15]">|</span>
                <span
                  class="font-semibold"
                  :class="gamePoints(game)
                    ? 'text-accent' : 'text-text-subtle'"
                >
                  {{ gamePoints(game)
                    ? `+${gamePoints(game)}` : '0' }} б.
                </span>
              </div>
            </div>

            <div class="flex shrink-0 items-center gap-2">
              <span
                v-if="game.isAlive != null"
                class="inline-block size-2 rounded-full"
                :class="game.isAlive
                  ? 'bg-traveller' : 'bg-dead'"
              />
              <span
                class="inline-flex w-7 items-center
                  justify-center rounded-full
                  py-0.5 text-[10px] font-semibold"
                :class="game.won
                  ? 'bg-win/10 text-win'
                  : 'bg-white/[0.04] text-text-muted'"
              >
                {{ game.won ? 'W' : 'L' }}
              </span>
            </div>
          </div>

          <!-- Timeline strip (only when role or alignment changed) -->
          <div
            v-if="game.hasRoleChange || game.hasAlignmentChange"
            class="mt-3 flex flex-wrap items-center
              gap-2 rounded-lg bg-white/[0.03]
              px-3 py-2"
          >
            <!-- Role change -->
            <template v-if="game.hasRoleChange">
              <div
                class="flex items-center gap-1.5
                  opacity-50"
              >
                <RoleAvatar
                  :image-url="game.startingRoleImageUrl"
                  :name="game.startingRoleName || ''"
                  :type="game.startingRoleType || 'townsfolk'"
                  size="xs"
                />
                <span class="text-xs text-text-muted">
                  {{ game.startingRoleName }}
                </span>
              </div>
              <i
                class="pi pi-arrow-right shrink-0
                  text-[10px] text-text-subtle"
              />
              <div class="flex items-center gap-1.5">
                <RoleAvatar
                  :image-url="game.endingRoleImageUrl"
                  :name="game.endingRoleName || game.roleName"
                  :type="game.endingRoleType || game.roleType"
                  size="xs"
                />
                <span
                  class="text-xs font-medium text-text"
                >
                  {{ game.endingRoleName || game.roleName }}
                </span>
                <i
                  v-if="game.isMvp"
                  class="pi pi-star-fill text-accent
                    text-[10px]"
                />
              </div>
            </template>

            <!-- Alignment change (separate or only) -->
            <template v-if="game.hasAlignmentChange">
              <span
                v-if="game.hasRoleChange"
                class="mx-1 text-text-subtle"
              >
                &#183;
              </span>
              <AlignmentTag
                :alignment="game.alignmentStart!"
                size="xs"
                muted
              />
              <i
                class="pi pi-arrow-right shrink-0
                  text-[10px] text-text-subtle"
              />
              <AlignmentTag
                :alignment="game.alignmentEnd!"
                size="xs"
              />
            </template>
          </div>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
