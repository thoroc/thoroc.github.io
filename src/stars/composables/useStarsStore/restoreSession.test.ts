import { afterEach, describe, expect, it } from 'bun:test'
import { resetStateForTests } from './resetStateForTests'
import { restoreSession } from './restoreSession'
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

describe('restoreSession', () => {
  afterEach(resetStateForTests)

  it('does nothing when there is nothing stored', () => {
    window.history.replaceState({}, '', '/')
    restoreSession()
    expect(qApplied.value).toBe('')
  })

  it('restores every saved filter field', () => {
    window.history.replaceState({}, '', '/')
    sessionStorage.setItem(
      STARS_FILTERS_SESSION_KEY,
      JSON.stringify({
        q: 'vue',
        language: 'Rust',
        license: 'MIT',
        starredYear: '2026',
        type: 'sources',
        sort: 'most_stars',
      }),
    )
    restoreSession()
    expect(qInput.value).toBe('vue')
    expect(qApplied.value).toBe('vue')
    expect(language.value).toBe('Rust')
    expect(license.value).toBe('MIT')
    expect(starredYear.value).toBe('2026')
    expect(type.value).toBe('sources')
    expect(sort.value).toBe('most_stars')
  })

  it('does nothing when a filter query param is already present in the URL', () => {
    window.history.replaceState({}, '', '/?stars-lang=Python')
    sessionStorage.setItem(
      STARS_FILTERS_SESSION_KEY,
      JSON.stringify({ language: 'Rust' }),
    )
    restoreSession()
    expect(language.value).toBe('all')
  })

  it('does not throw for invalid stored JSON', () => {
    window.history.replaceState({}, '', '/')
    sessionStorage.setItem(STARS_FILTERS_SESSION_KEY, 'not json')
    expect(() => restoreSession()).not.toThrow()
  })

  it('leaves fields untouched when the saved object omits them', () => {
    window.history.replaceState({}, '', '/')
    sessionStorage.setItem(
      STARS_FILTERS_SESSION_KEY,
      JSON.stringify({ language: 'Rust' }),
    )
    restoreSession()
    expect(language.value).toBe('Rust')
    expect(license.value).toBe('all')
  })
})
