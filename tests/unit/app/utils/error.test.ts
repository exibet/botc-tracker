import { describe, expect, it } from 'vitest'
import { extractErrorMessage } from '~~/app/utils/error'

describe('extractErrorMessage', () => {
  it('returns message from H3-style error.data.message', () => {
    const err = { data: { message: 'API error message' } }
    expect(extractErrorMessage(err, 'fallback')).toBe('API error message')
  })

  it('returns message from Error instance', () => {
    expect(extractErrorMessage(new Error('boom'), 'fallback')).toBe('boom')
  })

  it('returns fallback for unknown error shape', () => {
    expect(extractErrorMessage(null, 'fallback')).toBe('fallback')
    expect(extractErrorMessage(undefined, 'fallback')).toBe('fallback')
    expect(extractErrorMessage('string error', 'fallback')).toBe('fallback')
    expect(extractErrorMessage(42, 'fallback')).toBe('fallback')
  })

  it('returns fallback when data.message is not a string', () => {
    expect(extractErrorMessage({ data: { message: 123 } }, 'fallback')).toBe('fallback')
  })
})
