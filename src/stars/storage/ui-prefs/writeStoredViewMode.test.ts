import { afterEach, describe, expect, it } from 'bun:test'
import { STARS_UI_PREFS_KEY } from './constants'
import { readStoredViewMode } from './readStoredViewMode'
import { writeStoredViewMode } from './writeStoredViewMode'

describe('writeStoredViewMode', () => {
  afterEach(() => {
    localStorage.removeItem(STARS_UI_PREFS_KEY)
  })

  it('stores "galaxy" as-is', () => {
    writeStoredViewMode('galaxy')
    expect(readStoredViewMode()).toBe('galaxy')
  })

  it('normalizes any non-"galaxy" value to "list"', () => {
    writeStoredViewMode('grid')
    expect(readStoredViewMode()).toBe('list')
  })
})
