import { describe, expect, it } from 'bun:test'
import { mapLegacySort } from './mapLegacySort'

describe('mapLegacySort', () => {
  it('maps legacy "stars" to most_stars', () => {
    expect(mapLegacySort('stars')).toBe('most_stars')
  })

  it('maps legacy "date" to recently_starred', () => {
    expect(mapLegacySort('date')).toBe('recently_starred')
  })

  it('passes through already-current values', () => {
    expect(mapLegacySort('recently_active')).toBe('recently_active')
    expect(mapLegacySort('most_stars')).toBe('most_stars')
  })

  it('falls back to recently_starred for anything else', () => {
    expect(mapLegacySort('unknown')).toBe('recently_starred')
  })
})
