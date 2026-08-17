import { afterEach, describe, expect, it } from 'bun:test'
import { STARS_UI_PREFS_KEY } from './constants'
import { readStoredGalaxyAreaExpanded } from './readStoredGalaxyAreaExpanded'
import { writeStoredGalaxyAreaExpanded } from './writeStoredGalaxyAreaExpanded'

describe('writeStoredGalaxyAreaExpanded', () => {
  afterEach(() => {
    localStorage.removeItem(STARS_UI_PREFS_KEY)
  })

  it('coerces a truthy value to true', () => {
    writeStoredGalaxyAreaExpanded(true)
    expect(readStoredGalaxyAreaExpanded()).toBe(true)
  })

  it('coerces a falsy value to false', () => {
    writeStoredGalaxyAreaExpanded(false)
    expect(readStoredGalaxyAreaExpanded()).toBe(false)
  })
})
