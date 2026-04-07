import { describe, expect, it } from 'vitest'
import {
  getScriptLabel,
  getWinnerInfo,
  SCRIPTS,
  WINNERS,
} from '~/composables/useGameLabels'

describe('useGameLabels', () => {
  describe('SCRIPTS', () => {
    it('contains all 4 script types', () => {
      expect(SCRIPTS).toHaveLength(4)
      const values = SCRIPTS.map(s => s.value)
      expect(values).toContain('trouble_brewing')
      expect(values).toContain('bad_moon_rising')
      expect(values).toContain('sects_and_violets')
      expect(values).toContain('custom')
    })
  })

  describe('WINNERS', () => {
    it('contains good and evil', () => {
      expect(WINNERS).toHaveLength(2)
      expect(WINNERS.map(w => w.value)).toEqual(['good', 'evil'])
    })
  })

  describe('getScriptLabel', () => {
    it('returns UA label for known scripts', () => {
      expect(getScriptLabel('trouble_brewing')).toBe('Неприємності в місті')
      expect(getScriptLabel('bad_moon_rising')).toBe('Схід поганого місяця')
    })

    it('returns raw value for unknown scripts', () => {
      expect(getScriptLabel('unknown_script')).toBe('unknown_script')
    })
  })

  describe('getWinnerInfo', () => {
    it('returns info for good', () => {
      const info = getWinnerInfo('good')
      expect(info?.labelUa).toBe('Добро')
      expect(info?.severity).toBe('success')
    })

    it('returns info for evil', () => {
      const info = getWinnerInfo('evil')
      expect(info?.labelUa).toBe('Зло')
      expect(info?.severity).toBe('danger')
    })

    it('returns undefined for unknown', () => {
      expect(getWinnerInfo('neutral')).toBeUndefined()
    })
  })
})
