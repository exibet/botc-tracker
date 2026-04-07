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
    class="space-y-8"
    data-testid="game-form"
    @submit.prevent="handleSubmit"
  >
    <!-- Main fields grid -->
    <div
      class="grid gap-6 sm:grid-cols-2
        lg:grid-cols-3"
    >
      <!-- Date -->
      <div class="flex flex-col gap-2">
        <label
          for="game-date"
          class="text-sm font-semibold tracking-wide
            text-text-muted"
        >
          <i class="pi pi-calendar mr-1.5 text-xs" />
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

      <!-- Script -->
      <div class="flex flex-col gap-2">
        <label
          for="game-script"
          class="text-sm font-semibold tracking-wide
            text-text-muted"
        >
          <i class="pi pi-book mr-1.5 text-xs" />
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

      <!-- Custom script name -->
      <div
        v-if="form.script === 'custom'"
        class="flex flex-col gap-2"
      >
        <label
          for="game-custom-script"
          class="text-sm font-semibold tracking-wide
            text-text-muted"
        >
          Назва кастомного скрипту
        </label>
        <InputText
          id="game-custom-script"
          v-model="form.custom_script_name"
          fluid
        />
      </div>

      <!-- Storyteller -->
      <div class="flex flex-col gap-2">
        <label
          for="game-storyteller"
          class="text-sm font-semibold tracking-wide
            text-text-muted"
        >
          <i class="pi pi-user mr-1.5 text-xs" />
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

    <!-- Winner toggle -->
    <div>
      <label
        class="mb-3 block text-sm font-semibold
          tracking-wide text-text-muted"
      >
        <i class="pi pi-flag mr-1.5 text-xs" />
        Переможець
      </label>
      <div class="flex gap-3">
        <button
          v-for="w in WINNERS"
          :key="w.value"
          type="button"
          class="flex flex-1 cursor-pointer items-center
            justify-center gap-3 rounded-xl
            border-2 px-6 py-4
            transition-all duration-200
            sm:flex-none sm:min-w-48"
          :class="[
            form.winner === w.value
              ? w.value === 'good'
                ? 'border-good bg-[color-mix(in_srgb,var(--color-good)_12%,transparent)] shadow-[0_0_20px_-4px_var(--color-good)]'
                : 'border-evil bg-[color-mix(in_srgb,var(--color-evil)_12%,transparent)] shadow-[0_0_20px_-4px_var(--color-evil)]'
              : 'border-white/[0.08] bg-white/[0.02] hover:border-white/[0.15] hover:bg-white/[0.04]',
          ]"
          data-testid="game-winner"
          @click="form.winner = w.value"
        >
          <i
            :class="[
              w.icon,
              form.winner === w.value
                ? w.value === 'good'
                  ? 'text-good'
                  : 'text-evil'
                : 'text-text-muted',
            ]"
            class="text-2xl"
          />
          <span
            class="font-heading text-lg font-bold"
            :class="[
              form.winner === w.value
                ? w.value === 'good'
                  ? 'text-good'
                  : 'text-evil'
                : 'text-text-muted',
            ]"
          >
            {{ w.labelUa }}
          </span>
        </button>
      </div>
    </div>

    <!-- Notes -->
    <div class="flex flex-col gap-2">
      <label
        for="game-notes"
        class="text-sm font-semibold tracking-wide
          text-text-muted"
      >
        <i class="pi pi-pencil mr-1.5 text-xs" />
        Нотатки
      </label>
      <Textarea
        id="game-notes"
        v-model="form.notes"
        rows="4"
        fluid
        auto-resize
      />
    </div>
  </form>
</template>
