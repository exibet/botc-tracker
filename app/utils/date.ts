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

export function formatDateWithWeekday(
  dateStr: string,
): string {
  const d = new Date(dateStr)
  const formatted = d.toLocaleDateString('uk-UA', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
  return formatted.charAt(0).toUpperCase()
    + formatted.slice(1)
}

export function formatDateLong(
  dateStr: string,
): string {
  return new Date(dateStr).toLocaleDateString('uk-UA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
