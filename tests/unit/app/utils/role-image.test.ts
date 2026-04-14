import { describe, expect, it } from 'vitest'
import { resolveRoleImage } from '~~/app/utils/role-image'

describe('resolveRoleImage', () => {
  it('extracts role id from GitHub URL and maps to local webp', () => {
    const url = 'https://raw.githubusercontent.com/org/repo/path/empath.png'
    expect(resolveRoleImage(url)).toBe('/roles/empath.webp')
  })

  it('returns null for null/undefined', () => {
    expect(resolveRoleImage(null)).toBeNull()
    expect(resolveRoleImage(undefined)).toBeNull()
  })

  it('returns null for empty string', () => {
    expect(resolveRoleImage('')).toBeNull()
  })

  it('passes through existing /roles/ paths', () => {
    expect(resolveRoleImage('/roles/saint.webp')).toBe('/roles/saint.webp')
  })

  it('passes through unknown formats unchanged', () => {
    expect(resolveRoleImage('https://example.com/unknown')).toBe('https://example.com/unknown')
  })
})
