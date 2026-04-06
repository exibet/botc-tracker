<script setup lang="ts">
import type { Role } from '~/composables/useRoles'
import {
  EDITIONS,
  getRoleTypeColor,
  getRoleTypeInfo,
} from '~/composables/useRoleTypes'

const visible = defineModel<boolean>('visible')
const props = defineProps<{
  role: Role | null
}>()

const typeInfo = computed(() =>
  props.role ? getRoleTypeInfo(props.role.type) : undefined,
)
const typeColor = computed(() =>
  props.role ? getRoleTypeColor(props.role.type) : '',
)
const editionLabel = computed(() =>
  EDITIONS.find(e => e.value === props.role?.edition)?.label
  ?? props.role?.edition,
)
</script>

<template>
  <Dialog
    v-model:visible="visible"
    modal
    dismissable-mask
    :header="role?.name_ua ?? ''"
    class="w-[90vw] max-w-lg"
  >
    <div
      v-if="role"
      class="flex flex-col gap-4"
    >
      <div class="flex items-start gap-4">
        <div class="size-24 shrink-0">
          <img
            v-if="role.image_url"
            :src="role.image_url"
            :alt="role.name_en"
            class="size-full rounded-full object-cover"
          >
          <div
            v-else
            class="flex size-full items-center justify-center
              rounded-full bg-surface-hover text-3xl text-text-muted"
          >
            ?
          </div>
        </div>
        <div>
          <h3 class="font-heading text-xl font-bold text-text">
            {{ role.name_ua }}
          </h3>
          <p class="text-sm text-text-muted">
            {{ role.name_en }}
          </p>
          <div class="mt-2 flex gap-2">
            <span
              class="inline-block rounded-full px-2 py-0.5
                text-xs font-semibold uppercase tracking-wider"
              :style="{
                backgroundColor:
                  `oklch(from ${typeColor} l c h / 0.15)`,
                color: typeColor,
              }"
            >
              {{ typeInfo?.label ?? role.type }}
            </span>
            <span
              class="inline-block rounded-full bg-surface-hover
                px-2 py-0.5 text-xs text-text-muted"
            >
              {{ editionLabel }}
            </span>
          </div>
        </div>
      </div>

      <div>
        <h4
          class="mb-1 text-sm font-semibold uppercase
            tracking-wider text-text-muted"
        >
          Опис
        </h4>
        <p class="text-sm leading-relaxed text-text">
          {{ role.description_ua }}
        </p>
      </div>

      <div>
        <h4
          class="mb-1 text-sm font-semibold uppercase
            tracking-wider text-text-muted"
        >
          Description
        </h4>
        <p class="text-sm leading-relaxed text-text-muted">
          {{ role.description_en }}
        </p>
      </div>
    </div>
  </Dialog>
</template>
