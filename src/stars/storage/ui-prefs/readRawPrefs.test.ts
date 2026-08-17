import { afterEach, describe, expect, it } from 'bun:test'
import { STARS_UI_PREFS_KEY } from './constants'
import { readRawPrefs } from './readRawPrefs'

describe('readRawPrefs', () => {
  afterEach(() => {
    localStorage.removeItem(STARS_UI_PREFS_KEY)
  })

  it('returns an empty object when nothing is stored', () => {
    expect(readRawPrefs()).toEqual({})
  })

  it('parses stored JSON', () => {
    localStorage.setItem(STARS_UI_PREFS_KEY, JSON.stringify({ uiLocale: 'en' }))
    expect(readRawPrefs()).toEqual({ uiLocale: 'en' })
  })

  it('returns an empty object for invalid JSON', () => {
    localStorage.setItem(STARS_UI_PREFS_KEY, 'not json')
    expect(readRawPrefs()).toEqual({})
  })

  it('returns an empty object when stored value is not an object', () => {
    localStorage.setItem(STARS_UI_PREFS_KEY, JSON.stringify('a string'))
    expect(readRawPrefs()).toEqual({})
  })
})
