export function rankDisplay(
  index: number,
  rank: 'gold' | 'silver' | 'bronze' | null,
): string {
  if (rank === 'gold') return '\u{1F451}'
  if (rank === 'silver') return '\u{1F948}'
  if (rank === 'bronze') return '\u{1F949}'
  return String(index + 1)
}

export function pluralizeUa(
  count: number,
  one: string,
  few: string,
  many: string,
): string {
  return count === 1
    ? one
    : count >= 2 && count <= 4
      ? few
      : many
}

export function effectiveAlignment(
  alignmentEnd: string | null,
  alignmentStart: string | null,
): string | null {
  return alignmentEnd ?? alignmentStart
}
