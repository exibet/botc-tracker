<script setup lang="ts">
defineProps<{
  avatarUrl: string | null
  nickname: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
  ringClass?: string
}>()

const sizeClasses: Record<string, string> = {
  xs: '!size-5 !min-w-5 !max-w-5 !text-[8px]',
  sm: '!size-8 !min-w-8 !max-w-8 !text-[10px] !bg-gray-800',
  md: '!size-10 !min-w-10 !max-w-10',
  lg: '!size-16 !min-w-16 !max-w-16 sm:!size-20 sm:!min-w-20 sm:!max-w-20',
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
