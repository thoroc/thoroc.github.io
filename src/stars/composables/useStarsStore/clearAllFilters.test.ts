import { afterEach, describe, expect, it } from 'bun:test'
import { clearAllFilters } from './clearAllFilters'
import { resetStateForTests } from './resetStateForTests'
import {
  language,
  license,
  qApplied,
  qInput,
  STARS_FILTERS_SESSION_KEY,
  sort,
  starredYear,
  type,
} from './state'

describe('clearAllFilters', () => {
  afterEach(resetStateForTests)

  it('resets every filter ref to its default', () => {
    window.history.replaceState({}, '', '/?stars-lang=Rust&stars-q=vue')
    qInput.value = 'vue'
    qApplied.value = 'vue'
    language.value = 'Rust'
    license.value = 'MIT'
    starredYear.value = '2026'
    type.value = 'sources'
    sort.value = 'most_stars'

    clearAllFilters()

    expect(qInput.value).toBe('')
    expect(qApplied.value).toBe('')
    expect(language.value).toBe('all')
    expect(license.value).toBe('all')
    expect(starredYear.value).toBe('all')
    expect(type.value).toBe('all')
    expect(sort.value).toBe('recently_starred')
  })

  it('strips all filter query params from the URL', () => {
    window.history.replaceState(
      {},
      '',
      '/?stars-q=vue&stars-lang=Rust&stars-license=MIT&stars-year=2026&stars-type=sources&stars-sort=stars',
    )
    clearAllFilters()
    expect(window.location.search).toBe('')
  })

  it('clears the persisted session filters', () => {
    sessionStorage.setItem(STARS_FILTERS_SESSION_KEY, '{"q":"vue"}')
    clearAllFilters()
    expect(sessionStorage.getItem(STARS_FILTERS_SESSION_KEY)).toBeNull()
  })

  it('does not throw when sessionStorage.removeItem fails', () => {
    // Plain assignment is silently a no-op in this environment — see the
    // matching note in readCachedPageTitle.test.ts.
    const original = sessionStorage.removeItem
    Object.defineProperty(sessionStorage, 'removeItem', {
      value: () => {
        throw new Error('boom')
      },
      configurable: true,
    })
    expect(() => clearAllFilters()).not.toThrow()
    Object.defineProperty(sessionStorage, 'removeItem', {
      value: original,
      configurable: true,
    })
  })
})
