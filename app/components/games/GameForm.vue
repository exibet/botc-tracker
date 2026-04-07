<script setup lang="ts">
import type { Profile } from '~/types'
import { SCRIPTS, WINNERS } from '~/composables/useGameLabels'

const props = defineProps<{
  initialData?: {
    date: string
    script: string
    custom_script_name: string | null
    winner: string
    storyteller_id: string | null
    notes: string | null
  }
  players: Profile[]
  loading?: boolean
}>()

const emit = defineEmits<{
  submit: [data: {
    date: string
    script: string
    custom_script_name: string | null
    winner: string
    storyteller_id: string | null
    notes: string | null
  }]
}>()

const form = reactive({
  date: props.initialData?.date
    ? new Date(props.initialData.date)
    : new Date(),
  script: props.initialData?.script ?? 'trouble_brewing',
  custom_script_name:
    props.initialData?.custom_script_name ?? '',
  winner: props.initialData?.winner ?? 'good',
  storyteller_id: props.initialData?.storyteller_id ?? null,
  notes: props.initialData?.notes ?? '',
})

const scriptOptions = SCRIPTS.map(s => ({
  label: s.labelUa,
  value: s.value,
}))

const winnerOptions = WINNERS.map(w => ({
  label: w.labelUa,
  value: w.value,
}))

const storytellerOptions = computed(() =>
  (props.players ?? []).map(p => ({
    label: p.nickname,
    value: p.id,
  })),
)

function formatDateForDb(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function handleSubmit() {
  emit('submit', {
    date: formatDateForDb(form.date),
    script: form.script,
    custom_script_name: form.script === 'custom'
      ? (form.custom_script_name || null)
      : null,
    winner: form.winner,
    storyteller_id: form.storyteller_id || null,
    notes: form.notes || null,
  })
}
</script>

<template>
  <form
    class="space-y-5"
    data-testid="game-form"
    @submit.prevent="handleSubmit"
  >
    <div class="grid gap-5 sm:grid-cols-2">
      <div class="flex flex-col gap-1">
        <label
          for="game-date"
          class="text-sm font-medium text-text-muted"
        >
          Дата
        </label>
        <DatePicker
          id="game-date"
          v-model="form.date"
          date-format="dd.mm.yy"
          show-icon
          fluid
          data-testid="game-date"
        />
      </div>

      <div class="flex flex-col gap-1">
        <label
          for="game-script"
          class="text-sm font-medium text-text-muted"
        >
          Скрипт
        </label>
        <Select
          id="game-script"
          v-model="form.script"
          :options="scriptOptions"
          option-label="label"
          option-value="value"
          fluid
          data-testid="game-script"
        />
      </div>

      <div
        v-if="form.script === 'custom'"
        class="flex flex-col gap-1"
      >
        <label
          for="game-custom-script"
          class="text-sm font-medium text-text-muted"
        >
          Назва кастомного скрипту
        </label>
        <InputText
          id="game-custom-script"
          v-model="form.custom_script_name"
          fluid
        />
      </div>

      <div class="flex flex-col gap-1">
        <label
          for="game-winner"
          class="text-sm font-medium text-text-muted"
        >
          Переможець
        </label>
        <Select
          id="game-winner"
          v-model="form.winner"
          :options="winnerOptions"
          option-label="label"
          option-value="value"
          fluid
          data-testid="game-winner"
        />
      </div>

      <div class="flex flex-col gap-1">
        <label
          for="game-storyteller"
          class="text-sm font-medium text-text-muted"
        >
          Оповідач
        </label>
        <Select
          id="game-storyteller"
          v-model="form.storyteller_id"
          :options="storytellerOptions"
          option-label="label"
          option-value="value"
          placeholder="Оберіть оповідача"
          show-clear
          fluid
          data-testid="game-storyteller"
        />
      </div>
    </div>

    <div class="flex flex-col gap-1">
      <label
        for="game-notes"
        class="text-sm font-medium text-text-muted"
      >
        Нотатки
      </label>
      <Textarea
        id="game-notes"
        v-model="form.notes"
        rows="3"
        fluid
      />
    </div>

    <div class="flex justify-end gap-2">
      <NuxtLink to="/games">
        <Button
          label="Скасувати"
          severity="secondary"
          text
          type="button"
        />
      </NuxtLink>
      <Button
        label="Зберегти"
        icon="pi pi-check"
        type="submit"
        :loading="loading"
        data-testid="game-submit"
      />
    </div>
  </form>
</template>
