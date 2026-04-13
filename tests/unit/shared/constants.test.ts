import { describe, expect, it } from 'vitest'
import {
  ALIGNMENTS,
  EDITIONS,
  GAME_STATUSES,
  ROLE_TYPES,
  SCRIPTS,
  USER_ROLES,
  WINNERS,
} from '#shared/constants'

describe('shared constants', () => {
  it('defines SCRIPTS', () => {
    expect(SCRIPTS).toContain('trouble_brewing')
    expect(SCRIPTS).toContain('custom')
    expect(SCRIPTS).toHaveLength(4)
  })

  it('defines ALIGNMENTS', () => {
    expect(ALIGNMENTS).toEqual(['good', 'evil'])
  })

  it('defines WINNERS', () => {
    expect(WINNERS).toEqual(['good', 'evil'])
  })

  it('defines GAME_STATUSES', () => {
    expect(GAME_STATUSES).toContain('upcoming')
    expect(GAME_STATUSES).toContain('in_progress')
    expect(GAME_STATUSES).toContain('finished')
    expect(GAME_STATUSES).toHaveLength(3)
  })

  it('defines USER_ROLES', () => {
    expect(USER_ROLES).toEqual(['player', 'admin'])
  })

  it('defines ROLE_TYPES', () => {
    expect(ROLE_TYPES).toContain('townsfolk')
    expect(ROLE_TYPES).toContain('demon')
    expect(ROLE_TYPES).toHaveLength(6)
  })

  it('defines EDITIONS', () => {
    expect(EDITIONS).toContain('tb')
    expect(EDITIONS).toContain('bmr')
    expect(EDITIONS).toHaveLength(6)
  })
})
