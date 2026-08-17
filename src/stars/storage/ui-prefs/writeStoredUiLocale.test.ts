import { afterEach, describe, expect, it } from 'bun:test'
import { STARS_UI_PREFS_KEY } from './constants'
import { readStoredUiLocale } from './readStoredUiLocale'
import { writeStoredUiLocale } from './writeStoredUiLocale'

describe('writeStoredUiLocale', () => {
  afterEach(() => {
    localStorage.removeItem(STARS_UI_PREFS_KEY)
  })

  it('stores "en" as-is', () => {
    writeStoredUiLocale('en')
    expect(readStoredUiLocale()).toBe('en')
  })

  it('normalizes any non-"en" value to zh-CN', () => {
    writeStoredUiLocale('fr')
    expect(readStoredUiLocale()).toBe('zh-CN')
  })
})
