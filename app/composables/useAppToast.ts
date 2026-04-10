export function useAppToast() {
  const toast = useToast()

  function success(detail: string) {
    toast.add({
      severity: 'success',
      summary: 'Успішно',
      detail,
      life: 3000,
    })
  }

  function error(detail: string) {
    toast.add({
      severity: 'error',
      summary: 'Помилка',
      detail,
      life: 5000,
    })
  }

  return { success, error }
}
