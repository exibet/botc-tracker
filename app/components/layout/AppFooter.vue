<script setup lang="ts">
const year = new Date().getFullYear()
</script>

<template>
  <footer
    class="relative mt-auto
      before:absolute before:top-0 before:left-0
      before:h-px before:w-full
      before:bg-gradient-to-r before:from-transparent
      before:via-primary/30 before:to-transparent"
  >
    <div
      class="mx-auto max-w-[1600px] px-4 py-4
        sm:px-6 lg:px-8"
    >
      <div
        class="flex flex-col items-center gap-1
          text-sm sm:flex-row sm:justify-center sm:gap-0"
      >
        <span class="flex items-center gap-1.5">
          <span
            class="font-heading font-bold text-primary"
            aria-hidden="true"
          >⛧</span>
          <span class="font-heading font-semibold">
            <span class="text-accent">BotC</span>
            <span class="text-text"> Tracker</span>
          </span>
        </span>

        <span
          class="hidden text-text-subtle sm:inline sm:mx-2"
        >&middot;</span>

        <span class="text-text-subtle">
          Blood on the Clocktower &mdash;
          ком'юніті трекер
        </span>

        <span
          class="hidden text-text-subtle sm:inline sm:mx-2"
        >&middot;</span>

        <span class="text-text-subtle">
          {{ year }}
        </span>
      </div>
    </div>
  </footer>
</template>
