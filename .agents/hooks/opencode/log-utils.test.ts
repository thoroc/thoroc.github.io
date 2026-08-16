import { describe, expect, it } from 'bun:test'
import { localDateStamp, toLocalIso, truncate } from './log-utils'

describe('truncate', () => {
  it('keeps short strings', () => {
    expect(truncate('hi')).toBe('hi')
  })

  it('truncates long strings and reports the clipped length', () => {
    const long = 'a'.repeat(5000)
    const result = truncate(long)
    expect(result).toContain('<truncated 1000 chars>')
    expect((result as string).length).toBeLessThan(5000)
  })

  it('recurses into objects and arrays', () => {
    const value = { list: ['a'.repeat(5000)], n: 1 }
    const result = truncate(value)
    expect((result as { list: string[] }).list[0]).toContain('<truncated')
    expect((result as { n: number }).n).toBe(1)
  })

  it('passes through non-strings', () => {
    expect(truncate(null)).toBeNull()
    expect(truncate(42)).toBe(42)
    expect(truncate(true)).toBe(true)
  })
})

describe('toLocalIso', () => {
  it('formats a local timestamp with offset', () => {
    const iso = toLocalIso(new Date('2026-08-16T10:00:00Z'))
    expect(iso).toMatch(/^2026-08-16T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/)
  })
})

describe('localDateStamp', () => {
  it('formats a YYYY-MM-DD stamp', () => {
    expect(localDateStamp(new Date('2026-08-16T10:00:00Z'))).toBe('2026-08-16')
  })
})
