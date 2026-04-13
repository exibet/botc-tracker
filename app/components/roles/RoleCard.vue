<script setup lang="ts">
import type { Role } from '#shared/types'
import {
  EDITIONS,
  getRoleTypeColor,
  getRoleTypeInfo,
  getRoleTypeTagClass,
} from '~/composables/useRoleTypes'
import RoleAvatar from '~/components/games/RoleAvatar.vue'

const props = defineProps<{
  role: Role
  isLast?: boolean
}>()

const expanded = ref(false)

const typeInfo = computed(() => getRoleTypeInfo(props.role.type))
const typeColor = computed(() => getRoleTypeColor(props.role.type))
const tagClass = computed(() => getRoleTypeTagClass(props.role.type))
const editionLabel = computed(() =>
  EDITIONS.find(e => e.value === props.role.edition)?.label
  ?? props.role.edition,
)
</script>

<template>
  <div
    class="transition-colors duration-150"
    :class="[
      expanded
        ? 'border-l-2'
        : 'border-l-2 border-l-transparent hover:bg-white/[0.03]',
      !isLast ? 'border-b border-white/[0.06]' : '',
    ]"
    :style="expanded
      ? { borderLeftColor: typeColor }
      : undefined"
  >
    <button
      class="flex w-full cursor-pointer gap-3
        px-4 py-3.5 text-left sm:px-6"
      :class="expanded ? 'items-start' : 'items-center'"
      :aria-expanded="expanded"
      @click="expanded = !expanded"
    >
      <RoleAvatar
        :image-url="role.image_url"
        :name="role.name_ua"
        :type="role.type"
        size="lg"
      />

      <div class="min-w-0 flex-1">
        <div
          class="flex flex-col gap-1
            sm:flex-row sm:items-baseline sm:gap-4"
        >
          <p
            class="shrink-0 text-base font-semibold
              text-text sm:w-40"
          >
            {{ role.name_ua }}
          </p>
          <p
            class="text-sm text-text-muted sm:flex-1"
            :class="expanded
              ? 'whitespace-normal'
              : 'truncate'"
          >
            {{ role.description_ua }}
          </p>
        </div>

        <div
          v-if="expanded"
          class="mt-3 space-y-1 text-sm
            sm:ml-40 sm:pl-4"
        >
          <p class="font-medium text-white/80">
            {{ role.name_en }}
          </p>
          <p class="leading-relaxed text-text-subtle">
            {{ role.description_en }}
          </p>
          <div class="flex flex-wrap gap-2 pt-2">
            <Tag
              :value="typeInfo?.label ?? role.type"
              :class="tagClass"
              rounded
            />
            <Tag
              :value="editionLabel"
              severity="secondary"
              rounded
            />
          </div>
        </div>
      </div>

      <i
        class="shrink-0 text-xs text-text-subtle
          transition-transform duration-200
          pi pi-chevron-down"
        :class="{ 'rotate-180': expanded }"
      />
    </button>
  </div>
</template>
