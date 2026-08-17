import { afterEach, describe, expect, it } from 'bun:test'
import { STARS_UI_PREFS_KEY } from './constants'
import { readStoredGalaxyAreaExpanded } from './readStoredGalaxyAreaExpanded'

describe('readStoredGalaxyAreaExpanded', () => {
  afterEach(() => {
    localStorage.removeItem(STARS_UI_PREFS_KEY)
  })

  it('returns false when unset', () => {
    expect(readStoredGalaxyAreaExpanded()).toBe(false)
  })

  it('returns true when stored as true', () => {
    localStorage.setItem(
      STARS_UI_PREFS_KEY,
      JSON.stringify({ galaxyAreaExpanded: true }),
    )
    expect(readStoredGalaxyAreaExpanded()).toBe(true)
  })
})
