<script setup lang="ts">
const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'join': []
}>()

const saving = ref(false)

function handleSubmit() {
  saving.value = true
  emit('join')
}

function handleHide() {
  emit('update:visible', false)
  saving.value = false
}

watch(() => props.visible, (val) => {
  if (!val) saving.value = false
})
</script>

<template>
  <Dialog
    :visible="visible"
    modal
    :dismissable-mask="true"
    header="Приєднатися до гри"
    class="w-full max-w-sm"
    :breakpoints="{ '640px': '100vw' }"
    @update:visible="handleHide"
  >
    <p class="text-sm text-text-muted">
      Ви будете додані до списку гравців. Роль та бік
      можна вказати пізніше.
    </p>

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
          severity="success"
          :loading="saving"
          @click="handleSubmit"
        />
      </div>
    </template>
  </Dialog>
</template>
