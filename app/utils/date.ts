export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('uk-UA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function formatDateShort(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('uk-UA', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  })
}
