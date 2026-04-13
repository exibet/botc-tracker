<script setup lang="ts">
import type { Profile } from '~/types'
import { usePlayers } from '~/composables/usePlayers'
import { extractErrorMessage } from '~/utils/error'

const props = defineProps<{
  visible: boolean
  profile: Profile
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'unlinked': [manualId: string]
}>()

const { unlinkProfile } = usePlayers()
const unlinking = ref(false)
const errorMsg = ref('')
const nicknameInput = ref(props.profile.nickname)

function handleShow() {
  nicknameInput.value = props.profile.nickname
  errorMsg.value = ''
}

async function handleUnlink() {
  if (!nicknameInput.value.trim()) return
  unlinking.value = true
  errorMsg.value = ''
  try {
    const manualId = await unlinkProfile(
      props.profile.id,
      nicknameInput.value.trim(),
    )
    emit('unlinked', manualId)
    emit('update:visible', false)
  }
  catch (err: unknown) {
    errorMsg.value = extractErrorMessage(
      err, 'Помилка при від\'єднанні профілю',
    )
  }
  finally {
    unlinking.value = false
  }
}

function handleHide() {
  emit('update:visible', false)
}
</script>

<template>
  <Dialog
    :visible="visible"
    modal
    header="Від'єднати профіль"
    :style="{ width: '28rem' }"
    @update:visible="handleHide"
    @show="handleShow"
  >
    <div class="flex flex-col gap-4">
      <p class="text-sm text-text-muted">
        Ігрова історія буде перенесена в новий ручний
        профіль, а поточний акаунт залишиться без ігор.
        Потім можна зв'язати ручний профіль з іншим
        користувачем.
      </p>

      <div class="flex flex-col gap-1.5">
        <label
          for="unlink-nickname"
          class="text-sm font-medium"
        >
          Нікнейм для ручного профілю
        </label>
        <InputText
          id="unlink-nickname"
          v-model="nicknameInput"
          class="w-full"
        />
      </div>

      <Message
        v-if="errorMsg"
        severity="error"
        :closable="false"
      >
        {{ errorMsg }}
      </Message>

      <div class="flex justify-end gap-2">
        <Button
          label="Скасувати"
          severity="secondary"
          text
          @click="handleHide"
        />
        <Button
          label="Від'єднати"
          icon="pi pi-replay"
          severity="warn"
          :disabled="!nicknameInput.trim()"
          :loading="unlinking"
          @click="handleUnlink"
        />
      </div>
    </div>
  </Dialog>
</template>
