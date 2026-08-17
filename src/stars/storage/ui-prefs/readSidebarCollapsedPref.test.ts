import { afterEach, describe, expect, it } from 'bun:test'
import { STARS_UI_PREFS_KEY } from './constants'
import { readSidebarCollapsedPref } from './readSidebarCollapsedPref'

describe('readSidebarCollapsedPref', () => {
  afterEach(() => {
    localStorage.removeItem(STARS_UI_PREFS_KEY)
  })

  it('returns false when unset', () => {
    expect(readSidebarCollapsedPref()).toBe(false)
  })

  it('returns true when stored as true', () => {
    localStorage.setItem(
      STARS_UI_PREFS_KEY,
      JSON.stringify({ sidebarCollapsed: true }),
    )
    expect(readSidebarCollapsedPref()).toBe(true)
  })
})
