<script setup lang="ts">
import type { Role } from '~/composables/useRoles'
import {
  EDITIONS,
  getRoleTypeColor,
  getRoleTypeInfo,
  getRoleTypeTagClass,
} from '~/composables/useRoleTypes'

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
      !isLast && !expanded ? 'border-b border-white/[0.06]' : '',
      expanded && !isLast ? 'border-b border-white/[0.06]' : '',
    ]"
    :style="expanded
      ? { borderLeftColor: typeColor }
      : undefined"
  >
    <button
      class="flex w-full cursor-pointer items-center
        gap-3 px-4 py-3.5 text-left sm:px-6"
      :aria-expanded="expanded"
      @click="expanded = !expanded"
    >
      <img
        v-if="role.image_url"
        :src="role.image_url"
        :alt="role.name_en"
        class="size-10 shrink-0 rounded-full object-cover ring-2"
        :style="{
          '--tw-ring-color': `color-mix(in srgb, ${typeColor} 40%, transparent)`,
        }"
        loading="lazy"
      >
      <div
        v-else
        class="flex size-10 shrink-0 items-center
          justify-center rounded-full text-sm
          font-bold text-white/90 ring-2"
        :style="{
          'background-color': `color-mix(in srgb, ${typeColor} 20%, transparent)`,
          '--tw-ring-color': `color-mix(in srgb, ${typeColor} 40%, transparent)`,
        }"
      >
        {{ role.name_ua.charAt(0) }}
      </div>

      <div
        class="flex min-w-0 flex-1 flex-col
          sm:flex-row sm:items-center sm:gap-4"
      >
        <p
          class="shrink-0 truncate text-base
            font-semibold text-text sm:w-48"
        >
          {{ role.name_ua }}
        </p>
        <p
          class="mt-0.5 truncate text-sm
            text-text-muted sm:mt-0 sm:flex-1"
        >
          {{ role.description_ua }}
        </p>
      </div>

      <i
        class="pi pi-chevron-down shrink-0
          text-xs text-text-subtle transition-transform
          duration-200"
        :class="{ 'rotate-180': expanded }"
      />
    </button>

    <div
      class="grid transition-[grid-template-rows]
        duration-200 ease-out"
      :class="expanded
        ? 'grid-rows-[1fr]'
        : 'grid-rows-[0fr]'"
    >
      <div class="min-h-0 overflow-hidden">
        <div
          class="border-t border-white/[0.04]
            px-4 pb-4 pt-3 sm:ml-[52px] sm:px-6"
        >
          <p class="mb-3 text-sm leading-relaxed text-text/90">
            {{ role.description_ua }}
          </p>

          <p
            class="mb-1 text-sm font-medium text-text-muted"
          >
            {{ role.name_en }}
          </p>
          <p
            class="mb-4 text-sm leading-relaxed
              text-text-subtle"
          >
            {{ role.description_en }}
          </p>

          <div class="flex flex-wrap gap-2">
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
    </div>
  </div>
</template>
