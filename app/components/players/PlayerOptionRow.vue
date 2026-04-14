<script setup lang="ts">
import PlayerAvatar from '~/components/players/PlayerAvatar.vue'

defineProps<{
  avatarUrl: string | null
  nickname: string
}>()
</script>

<template>
  <div class="flex items-center gap-2">
    <PlayerAvatar
      :avatar-url="avatarUrl"
      :nickname="nickname"
      size="sm"
    />
    <span>{{ nickname }}</span>
  </div>
</template>
