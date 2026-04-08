export function useCountUp(
  target: Ref<number>,
  duration = 800,
): Ref<number> {
  const display = ref(0)

  watch(target, (newVal) => {
    if (!import.meta.client) {
      display.value = newVal
      return
    }

    const start = display.value
    const diff = newVal - start
    const startTime = performance.now()

    function animate(currentTime: number) {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - (1 - progress) ** 3
      display.value = Math.round(start + diff * eased)
      if (progress < 1) requestAnimationFrame(animate)
    }

    requestAnimationFrame(animate)
  }, { immediate: true })

  return display
}
