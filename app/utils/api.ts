export const $api: typeof $fetch = $fetch.create({
  onResponseError({ response }) {
    const data = response._data
    const message = data?.message
      ?? data?.statusMessage
      ?? 'Щось пішло не так'

    if (import.meta.client) {
      const { $toast } = useNuxtApp().vueApp.config.globalProperties
      $toast?.add({
        severity: 'error',
        summary: 'Помилка',
        detail: message,
        life: 5000,
      })
    }
  },
})
