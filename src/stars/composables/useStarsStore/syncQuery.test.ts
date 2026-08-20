import { afterEach, describe, expect, it } from 'bun:test'
import { resetStateForTests } from './resetStateForTests'
import {
  galaxyAreaExpanded,
  galaxyFocus,
  language,
  license,
  qApplied,
  sort,
  starredYear,
  type,
  uiLocale,
  viewMode,
} from './state'
import { syncQuery } from './syncQuery'

describe('syncQuery', () => {
  afterEach(resetStateForTests)

  it('writes no query params when all filters are at their defaults', () => {
    window.history.replaceState({}, '', '/')
    syncQuery()
    expect(window.location.search).toBe('')
  })

  it('writes each non-default filter into the query string', () => {
    window.history.replaceState({}, '', '/')
    uiLocale.value = 'fr'
    qApplied.value = ' vue '
    language.value = 'Rust'
    license.value = 'MIT'
    starredYear.value = '2026'
    type.value = 'sources'
    sort.value = 'most_stars'
    syncQuery()
    const params = new URLSearchParams(window.location.search)
    expect(params.get('lang')).toBe('fr')
    expect(params.get('stars-q')).toBe('vue')
    expect(params.get('stars-lang')).toBe('Rust')
    expect(params.get('stars-license')).toBe('MIT')
    expect(params.get('stars-year')).toBe('2026')
    expect(params.get('stars-type')).toBe('sources')
    expect(params.get('stars-sort')).toBe('most_stars')
  })

  it('writes stars-view and stars-focus for the galaxy view', () => {
    window.history.replaceState({}, '', '/')
    viewMode.value = 'galaxy'
    galaxyFocus.value = 'repo-1'
    syncQuery()
    const params = new URLSearchParams(window.location.search)
    expect(params.get('stars-view')).toBe('galaxy')
    expect(params.get('stars-focus')).toBe('repo-1')
  })

  it('writes stars-galaxy-expand=1 only while galaxy view is expanded', () => {
    window.history.replaceState({}, '', '/')
    viewMode.value = 'galaxy'
    galaxyAreaExpanded.value = true
    syncQuery()
    expect(
      new URLSearchParams(window.location.search).get('stars-galaxy-expand'),
    ).toBe('1')
  })

  it('does nothing when window is undefined', () => {
    const original = globalThis.window
    // @ts-expect-error -- simulating a non-browser environment
    globalThis.window = undefined
    expect(() => syncQuery()).not.toThrow()
    globalThis.window = original
  })
})
