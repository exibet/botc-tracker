import { describe, expect, it } from 'vitest'

describe('smoke test', () => {
  it('should pass a basic assertion', () => {
    expect(true).toBe(true)
  })

  it('should perform basic math', () => {
    expect(1 + 1).toBe(2)
  })
})
