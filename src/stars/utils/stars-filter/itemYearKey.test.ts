import { describe, expect, it } from 'bun:test'
import { itemYearKey } from './itemYearKey'

describe('itemYearKey', () => {
  it('extracts the year prefix from starredAt', () => {
    expect(itemYearKey({ starredAt: '2026-01-01' })).toBe('2026')
  })

  it('returns an empty string when starredAt is missing', () => {
    expect(itemYearKey({ starredAt: '' })).toBe('')
  })
})
