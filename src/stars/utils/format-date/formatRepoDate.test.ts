import { describe, expect, it } from 'bun:test'
import { formatRepoDate } from './formatRepoDate'

describe('formatRepoDate', () => {
  it('returns an empty string for a falsy iso value', () => {
    expect(formatRepoDate('')).toBe('')
  })

  it('returns an empty string for an unparseable date', () => {
    expect(formatRepoDate('not-a-date')).toBe('')
  })

  it('formats with the en locale by default', () => {
    expect(formatRepoDate('2026-01-15T00:00:00Z')).toBe('Jan 15, 2026')
  })

  it('formats with the en locale when requested', () => {
    expect(formatRepoDate('2026-01-15T00:00:00Z', 'en')).toBe('Jan 15, 2026')
  })

  it('formats with the fr-FR locale for any other locale', () => {
    expect(formatRepoDate('2026-01-15T00:00:00Z', 'fr')).toBe('15 janv. 2026')
  })
})
