import { afterEach, describe, expect, it } from 'bun:test'
import { LEGACY_FILTERS_KEY, LEGACY_SIDEBAR_KEY } from './constants'
import { migrateLegacyPrefs } from './migrateLegacyPrefs'

describe('migrateLegacyPrefs', () => {
  afterEach(() => {
    sessionStorage.removeItem(LEGACY_SIDEBAR_KEY)
    sessionStorage.removeItem(LEGACY_FILTERS_KEY)
  })

  it('does not touch prefs when sidebarCollapsed is already set', () => {
    sessionStorage.setItem(LEGACY_SIDEBAR_KEY, '1')
    const prefs = migrateLegacyPrefs({ sidebarCollapsed: false })
    expect(prefs.sidebarCollapsed).toBe(false)
  })

  it('migrates the legacy sidebar-collapsed flag when unset', () => {
    sessionStorage.setItem(LEGACY_SIDEBAR_KEY, '1')
    expect(migrateLegacyPrefs({}).sidebarCollapsed).toBe(true)
  })

  it('does not set sidebarCollapsed when the legacy value is not "1"', () => {
    sessionStorage.setItem(LEGACY_SIDEBAR_KEY, '0')
    expect(migrateLegacyPrefs({}).sidebarCollapsed).toBeUndefined()
  })

  it('migrates uiLocale/viewMode from the legacy filters key when both are unset', () => {
    sessionStorage.setItem(
      LEGACY_FILTERS_KEY,
      JSON.stringify({ uiLocale: 'en', viewMode: 'galaxy' }),
    )
    const prefs = migrateLegacyPrefs({})
    expect(prefs.uiLocale).toBe('en')
    expect(prefs.viewMode).toBe('galaxy')
  })

  it('does not overwrite an already-set uiLocale or viewMode', () => {
    sessionStorage.setItem(
      LEGACY_FILTERS_KEY,
      JSON.stringify({ uiLocale: 'en', viewMode: 'galaxy' }),
    )
    const prefs = migrateLegacyPrefs({ uiLocale: 'zh-CN', viewMode: 'list' })
    expect(prefs.uiLocale).toBe('zh-CN')
    expect(prefs.viewMode).toBe('list')
  })

  it('ignores invalid legacy filters JSON', () => {
    sessionStorage.setItem(LEGACY_FILTERS_KEY, 'not json')
    expect(() => migrateLegacyPrefs({})).not.toThrow()
  })

  it('returns prefs unchanged when no legacy data exists', () => {
    expect(migrateLegacyPrefs({ uiLocale: 'en' })).toEqual({ uiLocale: 'en' })
  })
})
