<script setup lang="ts">
const { isAuthenticated, isAdmin, profile, signInWithGoogle, signOut, loading }
  = useAuth()

const menuItems = ref([
  { label: 'Головна', icon: 'pi pi-home', route: '/' },
  { label: 'Ігри', icon: 'pi pi-list', route: '/games' },
  { label: 'Гравці', icon: 'pi pi-users', route: '/players' },
{ label: 'Ролі', icon: 'pi pi-book', route: '/roles' },
])

const userMenu = ref()
const userMenuItems = computed(() => [
  {
    label: profile.value?.nickname ?? 'Profile',
    icon: 'pi pi-user',
    disabled: true,
  },
  { separator: true },
  {
    label: 'Вийти',
    icon: 'pi pi-sign-out',
    command: () => signOut(),
  },
])

function toggleUserMenu(event: Event) {
  userMenu.value.toggle(event)
}

const userInitials = computed(() => {
  const name = profile.value?.nickname ?? ''
  return name.slice(0, 2).toUpperCase()
})
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
      <template #end>
        <div class="flex items-center gap-2">
          <Button
            v-if="!isAuthenticated"
            label="Увійти"
            icon="pi pi-sign-in"
            severity="contrast"
            text
            :loading="loading"
            data-testid="sign-in-btn"
            @click="signInWithGoogle()"
          />
          <div
            v-else
            class="relative"
          >
            <Avatar
              v-if="profile?.avatar_url"
              :image="profile.avatar_url"
              shape="circle"
              class="cursor-pointer"
              :pt="{
                image: { referrerpolicy: 'no-referrer' },
              }"
              data-testid="user-avatar"
              @click="toggleUserMenu"
            />
            <Avatar
              v-else
              :label="userInitials"
              shape="circle"
              class="cursor-pointer"
              data-testid="user-avatar"
              @click="toggleUserMenu"
            />
            <span
              v-if="isAdmin"
              class="absolute -right-1 -top-1 flex h-4 w-4
                items-center justify-center rounded-full
                bg-primary text-[10px] font-bold text-white"
              data-testid="admin-badge"
            >
              A
            </span>
            <Menu
              ref="userMenu"
              :model="userMenuItems"
              :popup="true"
              data-testid="user-menu"
            />
          </div>
        </div>
      </template>
    </Menubar>
  </header>
</template>
