<script setup lang="ts">
const menuItems = ref([
  { label: 'Головна', icon: 'pi pi-home', route: '/' },
  { label: 'Ігри', icon: 'pi pi-list', route: '/games' },
  { label: 'Гравці', icon: 'pi pi-users', route: '/players' },
  { label: 'Лідерборд', icon: 'pi pi-trophy', route: '/leaderboard' },
  { label: 'Ролі', icon: 'pi pi-book', route: '/roles' },
])
</script>

<template>
  <header>
    <Menubar
      :model="menuItems"
      class="sticky top-0 z-50 rounded-none border-b
        border-surface-border"
      :breakpoint="'768px'"
    >
      <template #start>
        <NuxtLink
          to="/"
          class="flex items-center gap-2"
        >
          <span
            class="font-heading text-lg font-bold
              text-primary"
          >
            BotC Tracker
          </span>
        </NuxtLink>
      </template>
      <template #item="{ item, props }">
        <NuxtLink
          v-if="item.route"
          v-bind="props.action"
          :to="item.route"
          class="flex items-center gap-2"
        >
          <span :class="item.icon" />
          <span>{{ item.label }}</span>
        </NuxtLink>
      </template>
    </Menubar>
  </header>
</template>
