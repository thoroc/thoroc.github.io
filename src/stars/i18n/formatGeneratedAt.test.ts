import { describe, expect, it } from 'bun:test'
import { formatGeneratedAt } from './formatGeneratedAt'

describe('formatGeneratedAt', () => {
  it('returns an em dash for a falsy iso value', () => {
    expect(formatGeneratedAt('', 'en')).toBe('—')
    expect(formatGeneratedAt(null, 'en')).toBe('—')
    expect(formatGeneratedAt(undefined, 'en')).toBe('—')
  })

  it('formats with en-US for the en locale', () => {
    const result = formatGeneratedAt('2026-01-15T08:00:00Z', 'en')
    expect(result).toContain('2026')
    expect(result).toContain('Jan')
  })

  it('formats with fr-FR for any other locale', () => {
    const result = formatGeneratedAt('2026-01-15T08:00:00Z', 'fr')
    expect(result).toContain('2026')
    expect(result).toContain('janvier')
  })
})
