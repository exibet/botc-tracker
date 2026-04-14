import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'
import { parseLimit, requireUuidParam, validateBody } from '~~/server/utils/validation'

const VALID_UUID = '12345678-1234-1234-1234-123456789abc'

function createHttpError(opts: { statusCode: number, message: string }) {
  const err = new Error(opts.message) as Error & { statusCode: number }
  err.statusCode = opts.statusCode
  return err
}

vi.stubGlobal('createError', createHttpError)
vi.stubGlobal('getRouterParam', (event: { params: Record<string, string> }, name: string) => event.params[name])
vi.stubGlobal('readBody', (event: { body: unknown }) => Promise.resolve(event.body))

describe('parseLimit', () => {
  it('returns default when value is undefined', () => {
    expect(parseLimit(undefined, 10, 100)).toBe(10)
  })

  it('returns default when value is NaN', () => {
    expect(parseLimit('abc', 10, 100)).toBe(10)
  })

  it('returns default when value is Infinity', () => {
    expect(parseLimit(Infinity, 10, 100)).toBe(10)
  })

  it('returns default when value is negative', () => {
    expect(parseLimit(-5, 10, 100)).toBe(10)
  })

  it('returns default when value is zero', () => {
    expect(parseLimit(0, 10, 100)).toBe(10)
  })

  it('returns parsed value when valid', () => {
    expect(parseLimit(50, 10, 100)).toBe(50)
  })

  it('clamps to max when value exceeds max', () => {
    expect(parseLimit(9999, 10, 100)).toBe(100)
  })

  it('floors decimal values', () => {
    expect(parseLimit(15.7, 10, 100)).toBe(15)
  })

  it('parses string numbers', () => {
    expect(parseLimit('25', 10, 100)).toBe(25)
  })
})

describe('requireUuidParam', () => {
  it('returns valid UUID', () => {
    const event = { params: { id: VALID_UUID } } as never
    expect(requireUuidParam(event, 'id')).toBe(VALID_UUID)
  })

  it('throws 400 on missing param', () => {
    const event = { params: {} } as never
    try {
      requireUuidParam(event, 'id')
      throw new Error('should have thrown')
    }
    catch (e) {
      expect((e as Error & { statusCode: number }).statusCode).toBe(400)
    }
  })

  it('throws 400 on non-UUID string', () => {
    const event = { params: { id: 'not-a-uuid' } } as never
    try {
      requireUuidParam(event, 'id')
      throw new Error('should have thrown')
    }
    catch (e) {
      expect((e as Error & { statusCode: number }).statusCode).toBe(400)
    }
  })

  it('throws 400 on SQL injection attempt', () => {
    const event = { params: { id: '1\' OR \'1\'=\'1' } } as never
    try {
      requireUuidParam(event, 'id')
      throw new Error('should have thrown')
    }
    catch (e) {
      expect((e as Error & { statusCode: number }).statusCode).toBe(400)
    }
  })

  it('accepts uppercase UUID', () => {
    const event = { params: { id: VALID_UUID.toUpperCase() } } as never
    expect(requireUuidParam(event, 'id')).toBe(VALID_UUID.toUpperCase())
  })
})

describe('validateBody', () => {
  const Schema = z.object({ name: z.string(), age: z.number() })

  it('returns valid body', async () => {
    const event = { body: { name: 'Alice', age: 30 } } as never
    const result = await validateBody(event, Schema)
    expect(result).toEqual({ name: 'Alice', age: 30 })
  })

  it('throws 400 with field-level errors on invalid body', async () => {
    const event = { body: { name: 'Alice' } } as never
    try {
      await validateBody(event, Schema)
      throw new Error('should have thrown')
    }
    catch (e) {
      const err = e as Error & { statusCode: number }
      expect(err.statusCode).toBe(400)
      expect(err.message).toContain('age')
    }
  })

  it('throws 400 with all field errors joined', async () => {
    const event = { body: { name: 123, age: 'thirty' } } as never
    try {
      await validateBody(event, Schema)
      throw new Error('should have thrown')
    }
    catch (e) {
      const err = e as Error
      expect(err.message).toContain('name')
      expect(err.message).toContain('age')
    }
  })
})
