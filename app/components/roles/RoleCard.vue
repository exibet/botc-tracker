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
    :class="expanded
      ? 'border-l-3 bg-surface-card'
      : 'bg-surface-card hover:bg-white/[0.04]'"
    :style="expanded
      ? { borderLeftColor: typeColor }
      : undefined"
  >
    <button
      class="flex w-full cursor-pointer items-center
        gap-3 px-4 py-3 text-left sm:px-6"
      :aria-expanded="expanded"
      @click="expanded = !expanded"
    >
      <img
        v-if="role.image_url"
        :src="role.image_url"
        :alt="role.name_en"
        class="size-10 shrink-0 rounded-full
          object-cover ring-2 ring-surface-ground"
        loading="lazy"
      >
      <div
        v-else
        class="flex size-10 shrink-0 items-center
          justify-center rounded-full
          text-sm font-bold ring-2 ring-surface-ground"
        :style="{ backgroundColor: typeColor }"
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
          text-text-muted transition-transform
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
          class="border-t border-surface-ground/50
            px-4 pb-4 pt-3 sm:ml-[52px] sm:px-6"
        >
          <p class="mb-2 text-sm leading-relaxed text-text">
            {{ role.description_ua }}
          </p>

          <p
            class="mb-1 font-heading text-base
              font-medium text-text/70"
          >
            {{ role.name_en }}
          </p>
          <p
            class="mb-3 text-sm leading-relaxed
              text-text-muted"
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
