import { describe, expect, it } from 'vitest'
import { formatDate, formatDateLong, formatDateShort, formatDateWithWeekday } from '~~/app/utils/date'

describe('formatDate', () => {
  it('formats valid date as DD.MM.YYYY (uk-UA)', () => {
    expect(formatDate('2026-01-15')).toBe('15.01.2026')
  })

  it('returns input on invalid date', () => {
    expect(formatDate('not-a-date')).toBe('not-a-date')
  })
})

describe('formatDateShort', () => {
  it('formats valid date with 2-digit year', () => {
    expect(formatDateShort('2026-01-15')).toBe('15.01.26')
  })

  it('returns input on invalid date', () => {
    expect(formatDateShort('garbage')).toBe('garbage')
  })
})

describe('formatDateWithWeekday', () => {
  it('returns capitalized formatted date for valid input', () => {
    const result = formatDateWithWeekday('2026-01-15') // Thursday
    expect(result.charAt(0)).toBe(result.charAt(0).toUpperCase())
    expect(result).toMatch(/15/)
  })

  it('returns input on invalid date', () => {
    expect(formatDateWithWeekday('bad')).toBe('bad')
  })
})

describe('formatDateLong', () => {
  it('formats valid date with month name', () => {
    const result = formatDateLong('2026-01-15')
    expect(result).toMatch(/15/)
    expect(result).toMatch(/2026/)
  })

  it('returns input on invalid date', () => {
    expect(formatDateLong('xx')).toBe('xx')
  })
})
