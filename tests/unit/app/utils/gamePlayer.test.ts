import { describe, expect, it } from 'vitest'
import {
  canDelete,
  canEdit,
  didWin,
  entryPoints,
  finalAlignment,
  finalRole,
  hasAlignmentChange,
  hasAnyChange,
  hasRole,
  hasRoleChange,
} from '~~/app/utils/gamePlayer'

const ROLE_TOWN = { id: 'r1', type: 'townsfolk' }
const ROLE_DEMON = { id: 'r2', type: 'demon' }

function entry(overrides: Record<string, unknown> = {}): never {
  return {
    player: { id: 'p1' },
    starting_role: ROLE_TOWN,
    ending_role: null,
    alignment_start: 'good',
    alignment_end: null,
    ...overrides,
  } as never
}

describe('didWin', () => {
  it('true when alignment matches winner', () => {
    expect(didWin(entry({ alignment_start: 'good' }), 'good')).toBe(true)
  })

  it('false when alignment differs', () => {
    expect(didWin(entry({ alignment_start: 'evil' }), 'good')).toBe(false)
  })

  it('null when no winner', () => {
    expect(didWin(entry(), null)).toBeNull()
  })

  it('null when no alignment', () => {
    expect(didWin(entry({ alignment_start: null }), 'good')).toBeNull()
  })

  it('uses ending alignment when set', () => {
    expect(didWin(entry({ alignment_start: 'good', alignment_end: 'evil' }), 'evil')).toBe(true)
  })
})

describe('canEdit', () => {
  it('false when no user', () => {
    expect(canEdit(entry(), null, false, 'in_progress')).toBe(false)
  })

  it('true for admin always', () => {
    expect(canEdit(entry(), 'u1', true, 'finished')).toBe(true)
  })

  it('false for non-admin when game not in_progress', () => {
    expect(canEdit(entry(), 'p1', false, 'finished')).toBe(false)
  })

  it('true for self in in_progress game', () => {
    expect(canEdit(entry(), 'p1', false, 'in_progress')).toBe(true)
  })

  it('false for other user', () => {
    expect(canEdit(entry(), 'other', false, 'in_progress')).toBe(false)
  })
})

describe('canDelete', () => {
  it('true for admin always', () => {
    expect(canDelete(entry(), 'u1', true, 'finished')).toBe(true)
  })

  it('false in finished game for non-admin', () => {
    expect(canDelete(entry(), 'p1', false, 'finished')).toBe(false)
  })

  it('false when no user', () => {
    expect(canDelete(entry(), null, false, 'upcoming')).toBe(false)
  })

  it('true for self in non-finished game', () => {
    expect(canDelete(entry(), 'p1', false, 'upcoming')).toBe(true)
  })
})

describe('hasRole / hasRoleChange / hasAlignmentChange / hasAnyChange', () => {
  it('hasRole — true when starting_role set', () => {
    expect(hasRole(entry())).toBe(true)
    expect(hasRole(entry({ starting_role: null }))).toBe(false)
  })

  it('hasRoleChange — true when ending differs from starting', () => {
    expect(hasRoleChange(entry({ ending_role: ROLE_DEMON }))).toBe(true)
    expect(hasRoleChange(entry({ ending_role: ROLE_TOWN }))).toBe(false)
    expect(hasRoleChange(entry())).toBe(false)
  })

  it('hasAlignmentChange — true when ending differs from starting', () => {
    expect(hasAlignmentChange(entry({ alignment_end: 'evil' }))).toBe(true)
    expect(hasAlignmentChange(entry({ alignment_end: 'good' }))).toBe(false)
  })

  it('hasAnyChange combines role + alignment changes', () => {
    expect(hasAnyChange(entry({ ending_role: ROLE_DEMON }))).toBe(true)
    expect(hasAnyChange(entry({ alignment_end: 'evil' }))).toBe(true)
    expect(hasAnyChange(entry())).toBe(false)
  })
})

describe('finalRole / finalAlignment', () => {
  it('finalRole returns ending when role changed', () => {
    expect(finalRole(entry({ ending_role: ROLE_DEMON }))).toBe(ROLE_DEMON)
  })

  it('finalRole returns starting when no change', () => {
    expect(finalRole(entry())).toBe(ROLE_TOWN)
  })

  it('finalAlignment returns ending when changed', () => {
    expect(finalAlignment(entry({ alignment_end: 'evil' }))).toBe('evil')
  })

  it('finalAlignment returns starting when not changed', () => {
    expect(finalAlignment(entry())).toBe('good')
  })
})

describe('entryPoints', () => {
  it('demon win = 2', () => {
    const e = entry({ starting_role: ROLE_DEMON, alignment_start: 'evil' })
    expect(entryPoints(e, 'evil')).toBe(2)
  })

  it('townsfolk win = 1', () => {
    expect(entryPoints(entry({ alignment_start: 'good' }), 'good')).toBe(1)
  })

  it('lose = 0', () => {
    expect(entryPoints(entry({ alignment_start: 'good' }), 'evil')).toBe(0)
  })

  it('no winner = 0', () => {
    expect(entryPoints(entry(), null)).toBe(0)
  })
})
