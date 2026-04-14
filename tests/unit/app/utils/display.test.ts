import { describe, expect, it } from 'vitest'
import { effectiveAlignment, pluralizeUa, rankDisplay } from '~~/app/utils/display'

describe('rankDisplay', () => {
  it('returns crown emoji for gold', () => {
    expect(rankDisplay(0, 'gold')).toBe('\u{1F451}')
  })

  it('returns silver medal for silver', () => {
    expect(rankDisplay(1, 'silver')).toBe('\u{1F948}')
  })

  it('returns bronze medal for bronze', () => {
    expect(rankDisplay(2, 'bronze')).toBe('\u{1F949}')
  })

  it('returns 1-based index when no rank', () => {
    expect(rankDisplay(3, null)).toBe('4')
    expect(rankDisplay(0, null)).toBe('1')
  })
})

describe('pluralizeUa', () => {
  it('returns "one" for 1, 21, 101', () => {
    expect(pluralizeUa(1, 'гра', 'гри', 'ігор')).toBe('гра')
    expect(pluralizeUa(21, 'гра', 'гри', 'ігор')).toBe('гра')
    expect(pluralizeUa(101, 'гра', 'гри', 'ігор')).toBe('гра')
  })

  it('returns "few" for 2-4, 22-24', () => {
    expect(pluralizeUa(2, 'гра', 'гри', 'ігор')).toBe('гри')
    expect(pluralizeUa(3, 'гра', 'гри', 'ігор')).toBe('гри')
    expect(pluralizeUa(24, 'гра', 'гри', 'ігор')).toBe('гри')
  })

  it('returns "many" for 0, 5-20, 25, 100', () => {
    expect(pluralizeUa(0, 'гра', 'гри', 'ігор')).toBe('ігор')
    expect(pluralizeUa(5, 'гра', 'гри', 'ігор')).toBe('ігор')
    expect(pluralizeUa(11, 'гра', 'гри', 'ігор')).toBe('ігор')
    expect(pluralizeUa(15, 'гра', 'гри', 'ігор')).toBe('ігор')
    expect(pluralizeUa(20, 'гра', 'гри', 'ігор')).toBe('ігор')
    expect(pluralizeUa(100, 'гра', 'гри', 'ігор')).toBe('ігор')
  })

  it('handles negative numbers via abs', () => {
    expect(pluralizeUa(-1, 'гра', 'гри', 'ігор')).toBe('гра')
  })
})

describe('effectiveAlignment', () => {
  it('returns end when set', () => {
    expect(effectiveAlignment('evil', 'good')).toBe('evil')
  })

  it('falls back to start when end is null', () => {
    expect(effectiveAlignment(null, 'good')).toBe('good')
  })

  it('returns null when both null', () => {
    expect(effectiveAlignment(null, null)).toBeNull()
  })
})
