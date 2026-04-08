<script setup lang="ts">
import { useCountUp } from '~/composables/useCountUp'

interface Props {
  label: string
  value: string | number
  icon: string
  color?: 'default' | 'good' | 'evil' | 'accent' | 'wins' | 'survival'
  subtitle?: string
}

const props = withDefaults(defineProps<Props>(), {
  color: 'default',
  subtitle: undefined,
})

const numericTarget = computed(() => {
  if (typeof props.value === 'number') return props.value
  const parsed = Number.parseInt(props.value, 10)
  return Number.isNaN(parsed) ? null : parsed
})

const suffix = computed(() => {
  if (typeof props.value !== 'string') return ''
  const match = props.value.match(/\D+$/)
  return match ? match[0] : ''
})

const animatedValue = useCountUp(
  computed(() => numericTarget.value ?? 0),
)

const displayValue = computed(() => {
  if (numericTarget.value === null) return props.value
  return `${animatedValue.value}${suffix.value}`
})

const colorConfig = computed(() => {
  switch (props.color) {
    case 'wins': return {
      icon: 'text-alive',
      value: 'text-alive',
      glow: 'var(--color-alive)',
      gradFrom: 'rgba(16, 185, 129, 0.12)',
      gradTo: 'rgba(16, 185, 129, 0.02)',
      border: 'rgba(16, 185, 129, 0.2)',
    }
    case 'good': return {
      icon: 'text-good',
      value: 'text-good',
      glow: 'var(--color-good)',
      gradFrom: 'rgba(59, 130, 246, 0.12)',
      gradTo: 'rgba(59, 130, 246, 0.02)',
      border: 'rgba(59, 130, 246, 0.2)',
    }
    case 'evil': return {
      icon: 'text-evil',
      value: 'text-evil',
      glow: 'var(--color-evil)',
      gradFrom: 'rgba(192, 57, 43, 0.12)',
      gradTo: 'rgba(192, 57, 43, 0.02)',
      border: 'rgba(192, 57, 43, 0.2)',
    }
    case 'accent': return {
      icon: 'text-accent',
      value: 'text-accent',
      glow: 'var(--color-accent)',
      gradFrom: 'rgba(212, 160, 23, 0.12)',
      gradTo: 'rgba(212, 160, 23, 0.02)',
      border: 'rgba(212, 160, 23, 0.2)',
    }
    case 'survival': return {
      icon: 'text-traveller',
      value: 'text-traveller',
      glow: 'var(--color-traveller)',
      gradFrom: 'rgba(139, 92, 246, 0.12)',
      gradTo: 'rgba(139, 92, 246, 0.02)',
      border: 'rgba(139, 92, 246, 0.2)',
    }
    default: return {
      icon: 'text-text-muted',
      value: 'text-text',
      glow: 'rgba(255, 255, 255, 0.3)',
      gradFrom: 'rgba(255, 255, 255, 0.04)',
      gradTo: 'rgba(255, 255, 255, 0.01)',
      border: 'rgba(255, 255, 255, 0.06)',
    }
  }
})
</script>

<template>
  <div
    class="group relative overflow-hidden rounded-xl
      p-4 transition-all duration-300
      hover:translate-y-[-1px]"
    :style="{
      background: `linear-gradient(135deg, ${colorConfig.gradFrom}, ${colorConfig.gradTo})`,
      border: `1px solid ${colorConfig.border}`,
    }"
  >
    <!-- Subtle top edge glow on hover -->
    <div
      class="pointer-events-none absolute inset-x-0
        top-0 h-px opacity-0
        transition-opacity duration-500
        group-hover:opacity-100"
      :style="{
        background: `linear-gradient(90deg, transparent, ${colorConfig.glow}, transparent)`,
      }"
    />

    <div class="relative flex items-start gap-3">
      <div
        class="flex size-10 shrink-0 items-center
          justify-center rounded-lg"
        :style="{
          backgroundColor: `color-mix(in srgb, ${colorConfig.glow} 15%, transparent)`,
        }"
      >
        <i
          :class="[icon, colorConfig.icon]"
          class="text-lg"
        />
      </div>
      <div class="min-w-0 flex-1">
        <p
          class="text-2xl font-bold leading-tight
            tracking-tight"
          :class="colorConfig.value"
        >
          {{ displayValue }}
        </p>
        <p
          class="mt-0.5 text-xs font-medium
            uppercase tracking-wider text-text-muted"
        >
          {{ label }}
        </p>
        <p
          v-if="subtitle"
          class="mt-0.5 text-[10px] text-text-subtle"
        >
          {{ subtitle }}
        </p>
      </div>
    </div>
  </div>
</template>
