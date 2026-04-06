<template>
  <div class="flex flex-col items-center justify-center py-20">
    <h1 class="font-heading text-5xl font-bold text-primary">
      Хроніки Годинникової Вежі
    </h1>
    <p class="mt-4 text-lg text-text-muted">
      Трекер ігор Blood on the Clocktower для ком'юніті
    </p>
    <div
      class="mt-8 flex gap-4"
    >
      <NuxtLink
        to="/games"
        class="rounded-lg bg-primary px-6 py-3
          font-semibold text-white transition
          hover:bg-primary-hover"
      >
        Ігри
      </NuxtLink>
      <NuxtLink
        to="/roles"
        class="rounded-lg border border-surface-border
          px-6 py-3 font-semibold text-text transition
          hover:bg-surface-hover"
      >
        Каталог ролей
      </NuxtLink>
    </div>
  </div>
</template>
