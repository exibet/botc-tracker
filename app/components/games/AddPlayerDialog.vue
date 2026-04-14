<script setup lang="ts">
import PlayerOptionRow
  from '~/components/players/PlayerOptionRow.vue'

const props = defineProps<{
  visible: boolean
  existingPlayerIds: string[]
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'add': [playerId: string]
  'create': [nickname: string]
}>()

const { players, playersLoading, initPlayers } = usePlayers()

const mode = ref<'existing' | 'new'>('existing')
const selectedPlayerId = ref<string | null>(null)
const newPlayerName = ref('')
const saving = ref(false)

const availablePlayers = computed(() =>
  (players.value ?? []).filter(
    p => !props.existingPlayerIds.includes(p.id),
  ),
)

const canSubmit = computed(() => {
  if (saving.value) return false
  if (mode.value === 'existing') return !!selectedPlayerId.value
  return newPlayerName.value.trim().length > 0
})

function handleSubmit() {
  if (!canSubmit.value) return
  saving.value = true
  if (mode.value === 'existing') {
    emit('add', selectedPlayerId.value!)
  }
  else {
    emit('create', newPlayerName.value.trim())
  }
}

function resetState() {
  selectedPlayerId.value = null
  newPlayerName.value = ''
  mode.value = 'existing'
  saving.value = false
}

function handleHide() {
  emit('update:visible', false)
  resetState()
}

watch(() => props.visible, (val) => {
  if (val) initPlayers()
  else resetState()
})
</script>

<template>
  <Dialog
    :visible="visible"
    modal
    :dismissable-mask="true"
    header="Додати гравця"
    class="w-full max-w-sm"
    :breakpoints="{ '640px': '100vw' }"
    @update:visible="handleHide"
  >
    <div class="flex flex-col gap-4">
      <!-- Mode tabs -->
      <SelectButton
        v-model="mode"
        :options="[
          { label: 'Існуючий', value: 'existing' },
          { label: 'Новий', value: 'new' },
        ]"
        option-label="label"
        option-value="value"
      />

      <!-- Existing player select -->
      <div
        v-if="mode === 'existing'"
        class="flex flex-col gap-2"
      >
        <label class="text-sm font-medium">
          Гравець
        </label>
        <div
          v-if="playersLoading"
          class="flex justify-center py-4"
        >
          <ProgressSpinner
            style="width: 2rem; height: 2rem"
          />
        </div>
        <Select
          v-else
          v-model="selectedPlayerId"
          :options="availablePlayers"
          option-label="nickname"
          option-value="id"
          placeholder="Оберіть гравця"
          filter
          filter-placeholder="Пошук..."
          fluid
        >
          <template #option="{ option }">
            <PlayerOptionRow
              :avatar-url="option.avatar_url"
              :nickname="option.nickname"
            />
          </template>
        </Select>
      </div>

      <!-- New player name -->
      <div
        v-else
        class="flex flex-col gap-2"
      >
        <label class="text-sm font-medium">
          Ім'я гравця
        </label>
        <InputText
          v-model="newPlayerName"
          placeholder="Введіть ім'я"
          fluid
        />
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
          label="Додати"
          icon="pi pi-plus"
          severity="success"
          :disabled="!canSubmit"
          :loading="saving"
          @click="handleSubmit"
        />
      </div>
    </template>
  </Dialog>
</template>
