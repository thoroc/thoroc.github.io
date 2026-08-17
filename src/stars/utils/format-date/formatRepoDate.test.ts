import { describe, expect, it } from 'bun:test'
import { formatRepoDate } from './formatRepoDate'

describe('formatRepoDate', () => {
  it('returns an empty string for a falsy iso value', () => {
    expect(formatRepoDate('')).toBe('')
  })

  it('returns an empty string for an unparseable date', () => {
    expect(formatRepoDate('not-a-date')).toBe('')
  })

  it('formats with the zh-CN locale by default', () => {
    expect(formatRepoDate('2026-01-15T00:00:00Z')).toBe('2026年1月15日')
  })

  it('formats with the en locale when requested', () => {
    expect(formatRepoDate('2026-01-15T00:00:00Z', 'en')).toBe('Jan 15, 2026')
  })
})
