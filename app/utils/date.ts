function safeDate(dateStr: string): Date | null {
  const d = new Date(dateStr)
  return isNaN(d.getTime()) ? null : d
}

export function formatDate(dateStr: string): string {
  return safeDate(dateStr)?.toLocaleDateString('uk-UA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }) ?? dateStr
}

export function formatDateShort(dateStr: string): string {
  return safeDate(dateStr)?.toLocaleDateString('uk-UA', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  }) ?? dateStr
}

export function formatDateWithWeekday(
  dateStr: string,
): string {
  const d = safeDate(dateStr)
  if (!d) return dateStr
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
  return safeDate(dateStr)?.toLocaleDateString('uk-UA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }) ?? dateStr
}
