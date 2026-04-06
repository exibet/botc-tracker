import { describe, expect, it } from 'vitest'
import {
  EDITIONS,
  getRoleTypeColor,
  getRoleTypeInfo,
  getRoleTypeTagClass,
  ROLE_TYPES,
} from '~/composables/useRoleTypes'

describe('useRoleTypes', () => {
  describe('ROLE_TYPES', () => {
    it('has 6 role types', () => {
      expect(ROLE_TYPES).toHaveLength(6)
    })

    it('contains all expected types', () => {
      const values = ROLE_TYPES.map(t => t.value)
      expect(values).toEqual([
        'townsfolk',
        'outsider',
        'minion',
        'demon',
        'traveller',
        'fabled',
      ])
    })

    it('each type has a Ukrainian label', () => {
      for (const type of ROLE_TYPES) {
        expect(type.label).toBeTruthy()
      }
    })

    it('each type has a CSS color variable', () => {
      for (const type of ROLE_TYPES) {
        expect(type.color).toMatch(/^var\(--color-/)
      }
    })
  })

  describe('EDITIONS', () => {
    it('has 6 editions', () => {
      expect(EDITIONS).toHaveLength(6)
    })

    it('contains all expected editions', () => {
      const values = EDITIONS.map(e => e.value)
      expect(values).toEqual([
        'tb', 'bmr', 'snv', 'experimental', 'ks', 'base3',
      ])
    })
  })

  describe('getRoleTypeInfo', () => {
    it('returns info for known type', () => {
      const info = getRoleTypeInfo('townsfolk')
      expect(info).toBeDefined()
      expect(info?.label).toBe('Городяни')
    })

    it('returns undefined for unknown type', () => {
      expect(getRoleTypeInfo('unknown')).toBeUndefined()
    })
  })

  describe('getRoleTypeColor', () => {
    it('returns color for known type', () => {
      expect(getRoleTypeColor('demon')).toBe('var(--color-demon)')
    })

    it('returns fallback for unknown type', () => {
      expect(getRoleTypeColor('unknown')).toBe('var(--color-text-muted)')
    })
  })

  describe('getRoleTypeTagClass', () => {
    it('returns correct CSS class', () => {
      expect(getRoleTypeTagClass('townsfolk')).toBe('p-tag-townsfolk')
      expect(getRoleTypeTagClass('demon')).toBe('p-tag-demon')
    })
  })
})
