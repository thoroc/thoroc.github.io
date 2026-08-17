import { afterEach, describe, expect, it } from 'bun:test'
import { STARS_UI_PREFS_KEY } from './constants'
import { readUiPrefs } from './readUiPrefs'

describe('readUiPrefs', () => {
  afterEach(() => {
    localStorage.removeItem(STARS_UI_PREFS_KEY)
  })

  it('returns an empty object with no stored data', () => {
    expect(readUiPrefs()).toEqual({})
  })

  it('reads through to stored raw prefs', () => {
    localStorage.setItem(
      STARS_UI_PREFS_KEY,
      JSON.stringify({ viewMode: 'galaxy' }),
    )
    expect(readUiPrefs().viewMode).toBe('galaxy')
  })
})
