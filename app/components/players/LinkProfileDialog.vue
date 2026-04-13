<script setup lang="ts">
import type { Profile } from '#shared/types'
import { usePlayers } from '~/composables/usePlayers'
import { extractErrorMessage } from '~/utils/error'
import PlayerAvatar
  from '~/components/players/PlayerAvatar.vue'

const props = defineProps<{
  visible: boolean
  manualProfile: Profile
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'linked': [authId: string]
}>()

const {
  players,
  playersLoading,
  initPlayers,
  linkProfile,
} = usePlayers()
const linking = ref(false)
const selectedAuthId = ref<string | null>(null)
const errorMsg = ref('')

const authProfiles = computed(() =>
  (players.value ?? []).filter(
    p => !p.is_manual && p.id !== props.manualProfile.id,
  ),
)

async function handleLink() {
  if (!selectedAuthId.value) return
  linking.value = true
  errorMsg.value = ''
  try {
    await linkProfile(
      props.manualProfile.id,
      selectedAuthId.value,
    )
    emit('linked', selectedAuthId.value)
    emit('update:visible', false)
  }
  catch (err) {
    errorMsg.value = extractErrorMessage(
      err, 'Помилка при зв\'язуванні профілів',
    )
  }
  finally {
    linking.value = false
  }
}

function handleShow() {
  selectedAuthId.value = null
  errorMsg.value = ''
  initPlayers()
}

function handleHide() {
  emit('update:visible', false)
}
</script>

<template>
  <Dialog
    :visible="visible"
    modal
    :header="`Зв'язати: ${manualProfile.nickname}`"
    :style="{ width: '28rem' }"
    @show="handleShow"
    @update:visible="handleHide"
  >
    <div class="flex flex-col gap-4">
      <p class="text-sm text-text-muted">
        Оберіть зареєстрованого користувача, з яким
        потрібно об'єднати профіль.
        Вся ігрова історія буде перенесена.
      </p>

      <div
        v-if="playersLoading"
        class="flex justify-center py-4"
      >
        <ProgressSpinner
          style="width: 2rem; height: 2rem"
        />
      </div>

      <div
        v-else-if="!authProfiles.length"
        class="rounded-lg border border-white/[0.06]
          bg-white/[0.02] px-4 py-3 text-center
          text-sm text-text-muted"
      >
        Немає зареєстрованих користувачів для
        зв'язування
      </div>

      <Select
        v-else
        v-model="selectedAuthId"
        :options="authProfiles"
        option-value="id"
        option-label="nickname"
        placeholder="Оберіть користувача..."
        filter
        filter-placeholder="Пошук..."
        class="w-full"
      >
        <template #option="{ option }">
          <div class="flex items-center gap-2">
            <PlayerAvatar
              :avatar-url="option.avatar_url"
              :nickname="option.nickname"
              size="sm"
            />
            <span>{{ option.nickname }}</span>
          </div>
        </template>
      </Select>

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
          label="Об'єднати"
          icon="pi pi-link"
          :disabled="!selectedAuthId"
          :loading="linking"
          @click="handleLink"
        />
      </div>
    </div>
  </Dialog>
</template>
