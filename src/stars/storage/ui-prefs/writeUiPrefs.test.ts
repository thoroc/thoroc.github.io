import { afterEach, describe, expect, it } from 'bun:test'
import { STARS_UI_PREFS_KEY } from './constants'
import { writeUiPrefs } from './writeUiPrefs'

describe('writeUiPrefs', () => {
  afterEach(() => {
    localStorage.removeItem(STARS_UI_PREFS_KEY)
  })

  it('merges the patch onto existing stored prefs', () => {
    writeUiPrefs({ uiLocale: 'en' })
    writeUiPrefs({ viewMode: 'galaxy' })
    const stored = JSON.parse(
      localStorage.getItem(STARS_UI_PREFS_KEY) as string,
    )
    expect(stored).toEqual({ uiLocale: 'en', viewMode: 'galaxy' })
  })

  it('does not throw when localStorage.setItem fails', () => {
    const original = localStorage.setItem
    localStorage.setItem = () => {
      throw new Error('quota exceeded')
    }
    expect(() => writeUiPrefs({ uiLocale: 'en' })).not.toThrow()
    localStorage.setItem = original
  })
})
