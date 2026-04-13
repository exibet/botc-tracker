export const $api: typeof $fetch = $fetch.create({
  onResponseError({ response }) {
    const data = response._data
    const message = data?.message
      ?? data?.statusMessage
      ?? 'Щось пішло не так'
    useAppToast().error(message)
  },
})
