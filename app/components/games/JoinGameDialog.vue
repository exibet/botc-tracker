<script setup lang="ts">
import type { Role, Alignment } from '~/types'
import { getAlignmentForRoleType }
  from '~/composables/useRoleTypes'
import RolePickerPanel
  from '~/components/games/RolePickerPanel.vue'

const props = defineProps<{
  visible: boolean
  roles: Role[]
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'join': [data: {
    starting_role_id: string
    alignment_start: Alignment
  }]
}>()

const selectedRole = ref<Role | null>(null)
const alignmentOverride = ref<Alignment>('good')
const saving = ref(false)

const alignment = computed<Alignment>(() => {
  if (!selectedRole.value) return 'good'
  return getAlignmentForRoleType(selectedRole.value.type)
    ?? alignmentOverride.value
})

const needsManualAlignment = computed(() =>
  selectedRole.value
    ? getAlignmentForRoleType(selectedRole.value.type) === null
    : false,
)

const canSubmit = computed(() =>
  !!selectedRole.value && !saving.value,
)

function handleRoleSelect(role: Role) {
  selectedRole.value = role
  const derived = getAlignmentForRoleType(role.type)
  if (derived) alignmentOverride.value = derived
}

function handleSubmit() {
  if (!selectedRole.value) return
  saving.value = true
  emit('join', {
    starting_role_id: selectedRole.value.id,
    alignment_start: alignment.value,
  })
}

function resetState() {
  selectedRole.value = null
  alignmentOverride.value = 'good'
  saving.value = false
}

function handleHide() {
  emit('update:visible', false)
  resetState()
}

watch(() => props.visible, (val) => {
  if (!val) resetState()
})
</script>

<template>
  <Dialog
    :visible="visible"
    modal
    :dismissable-mask="true"
    header="Приєднатися до гри"
    class="w-full max-w-lg"
    :breakpoints="{ '640px': '100vw' }"
    @update:visible="handleHide"
  >
    <div class="flex flex-col gap-5">
      <!-- Role selection -->
      <div class="flex flex-col gap-2">
        <label class="text-sm font-medium">
          Роль
        </label>
        <RolePickerPanel
          :roles="roles"
          :selected-id="selectedRole?.id ?? null"
          @select="handleRoleSelect"
        />
      </div>

      <!-- Alignment — only for traveller/fabled -->
      <div
        v-if="needsManualAlignment"
        class="flex flex-col gap-2"
      >
        <label class="text-sm font-medium">
          Бік
        </label>
        <div class="flex gap-2">
          <Button
            label="Добро"
            icon="pi pi-sun"
            severity="secondary"
            :outlined="alignmentOverride !== 'good'"
            size="small"
            @click="alignmentOverride = 'good'"
          />
          <Button
            label="Зло"
            icon="pi pi-moon"
            severity="secondary"
            :outlined="alignmentOverride !== 'evil'"
            size="small"
            @click="alignmentOverride = 'evil'"
          />
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <Button
          label="Скасувати"
          severity="secondary"
          text
          @click="handleHide"
        />
        <Button
          label="Приєднатися"
          icon="pi pi-plus"
          :disabled="!canSubmit"
          :loading="saving"
          @click="handleSubmit"
        />
      </div>
    </template>
  </Dialog>
</template>
