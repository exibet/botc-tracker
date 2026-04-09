<script setup lang="ts">
defineProps<{
  avatarUrl: string | null
  nickname: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
  ringClass?: string
}>()

const sizeClasses: Record<string, string> = {
  xs: '!h-5 !w-5 !text-[8px]',
  sm: '!h-8 !w-8',
  md: '!h-10 !w-10',
  lg: '!h-16 !w-16 sm:!h-20 sm:!w-20',
}
</script>

<template>
  <Avatar
    v-if="avatarUrl"
    :image="avatarUrl"
    :pt="{ image: { referrerpolicy: 'no-referrer' } }"
    shape="circle"
    :class="[sizeClasses[size ?? 'md'], ringClass]"
  />
  <Avatar
    v-else
    :label="nickname.slice(0, 2).toUpperCase()"
    shape="circle"
    :class="[sizeClasses[size ?? 'md'], ringClass]"
  />
</template>
