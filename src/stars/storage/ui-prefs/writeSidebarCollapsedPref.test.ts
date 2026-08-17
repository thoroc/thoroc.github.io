import { afterEach, describe, expect, it } from 'bun:test'
import { STARS_UI_PREFS_KEY } from './constants'
import { readSidebarCollapsedPref } from './readSidebarCollapsedPref'
import { writeSidebarCollapsedPref } from './writeSidebarCollapsedPref'

describe('writeSidebarCollapsedPref', () => {
  afterEach(() => {
    localStorage.removeItem(STARS_UI_PREFS_KEY)
  })

  it('persists the collapsed flag for later reads', () => {
    writeSidebarCollapsedPref(true)
    expect(readSidebarCollapsedPref()).toBe(true)
  })
})
