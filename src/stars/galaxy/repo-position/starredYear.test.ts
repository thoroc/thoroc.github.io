import { describe, expect, it } from 'bun:test'
import { starredYear } from './starredYear'

describe('starredYear', () => {
  it('parses the year from an ISO date string', () => {
    expect(starredYear('2022-05-01T00:00:00Z')).toBe(2022)
  })

  it('falls back to the max year for unparseable input', () => {
    expect(starredYear(undefined)).toBeGreaterThan(0)
  })

  it('clamps to the configured year range', () => {
    expect(starredYear('1900-01-01')).toBeGreaterThan(1900)
  })
})
