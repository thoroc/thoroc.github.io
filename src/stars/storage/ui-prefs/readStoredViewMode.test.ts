import { afterEach, describe, expect, it } from 'bun:test'
import { STARS_UI_PREFS_KEY } from './constants'
import { readStoredViewMode } from './readStoredViewMode'

describe('readStoredViewMode', () => {
  afterEach(() => {
    localStorage.removeItem(STARS_UI_PREFS_KEY)
  })

  it('returns an empty string when unset', () => {
    expect(readStoredViewMode()).toBe('')
  })

  it('returns a valid stored mode', () => {
    localStorage.setItem(
      STARS_UI_PREFS_KEY,
      JSON.stringify({ viewMode: 'galaxy' }),
    )
    expect(readStoredViewMode()).toBe('galaxy')
  })

  it('returns an empty string for an invalid stored mode', () => {
    localStorage.setItem(
      STARS_UI_PREFS_KEY,
      JSON.stringify({ viewMode: 'grid' }),
    )
    expect(readStoredViewMode()).toBe('')
  })
})
