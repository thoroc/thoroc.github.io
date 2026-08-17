import { afterEach, describe, expect, it } from 'bun:test'
import { STARS_UI_PREFS_KEY } from './constants'
import { readStoredUiLocale } from './readStoredUiLocale'

describe('readStoredUiLocale', () => {
  afterEach(() => {
    localStorage.removeItem(STARS_UI_PREFS_KEY)
  })

  it('returns an empty string when unset', () => {
    expect(readStoredUiLocale()).toBe('')
  })

  it('returns a valid stored locale', () => {
    localStorage.setItem(STARS_UI_PREFS_KEY, JSON.stringify({ uiLocale: 'en' }))
    expect(readStoredUiLocale()).toBe('en')
  })

  it('returns an empty string for an invalid stored locale', () => {
    localStorage.setItem(STARS_UI_PREFS_KEY, JSON.stringify({ uiLocale: 'fr' }))
    expect(readStoredUiLocale()).toBe('')
  })
})
