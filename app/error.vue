<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()

const is404 = computed(() => props.error.statusCode === 404)

const title = computed(() =>
  is404.value ? 'Сторінку не знайдено' : 'Щось пішло не так',
)

const description = computed(() =>
  is404.value
    ? 'Цієї сторінки не існує або вона була переміщена.'
    : 'Сталася непередбачена помилка. Спробуйте оновити сторінку.',
)

function handleError() {
  clearError({ redirect: '/' })
}
</script>

<template>
  <div
    class="flex min-h-screen flex-col items-center justify-center
           bg-[var(--botc-night-950)] px-4 text-[var(--text)]"
  >
    <p class="font-heading text-7xl font-bold text-[var(--botc-red-500)]">
      {{ error.statusCode }}
    </p>

    <h1 class="mt-4 text-2xl font-semibold">
      {{ title }}
    </h1>

    <p class="mt-2 max-w-md text-center text-sm text-[var(--text-muted)]">
      {{ description }}
    </p>

    <button
      class="mt-8 rounded-lg bg-[var(--botc-red-600)] px-6 py-2.5
        text-sm font-medium text-white transition-colors
        hover:bg-[var(--botc-red-500)]"
      @click="handleError"
    >
      На головну
    </button>
  </div>
</template>
