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

  it('stores "fr" as-is', () => {
    writeStoredUiLocale('fr')
    expect(readStoredUiLocale()).toBe('fr')
  })

  it('normalizes any other value to fr', () => {
    writeStoredUiLocale('zh-CN')
    expect(readStoredUiLocale()).toBe('fr')
  })
})
