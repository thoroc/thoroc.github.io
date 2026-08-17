import { afterEach, describe, expect, it } from 'bun:test'
import { applyQuery } from './applyQuery'
import { resetStateForTests } from './resetStateForTests'
import {
  galaxyAreaExpanded,
  galaxyFocus,
  language,
  license,
  qApplied,
  qInput,
  sort,
  starredYear,
  type,
  uiLocale,
  viewMode,
} from './state'

describe('applyQuery', () => {
  afterEach(resetStateForTests)

  it('resets all filters to defaults with no query params', () => {
    window.history.replaceState({}, '', '/')
    applyQuery()
    expect(language.value).toBe('all')
    expect(license.value).toBe('all')
    expect(starredYear.value).toBe('all')
    expect(type.value).toBe('all')
    expect(qInput.value).toBe('')
    expect(qApplied.value).toBe('')
    expect(viewMode.value).toBe('list')
    expect(galaxyFocus.value).toBe('')
  })

  it('reads filter values from query params', () => {
    window.history.replaceState(
      {},
      '',
      '/?stars-lang=Rust&stars-license=MIT&stars-year=2026&stars-q=vue&stars-type=sources',
    )
    applyQuery()
    expect(language.value).toBe('Rust')
    expect(license.value).toBe('MIT')
    expect(starredYear.value).toBe('2026')
    expect(qInput.value).toBe('vue')
    expect(qApplied.value).toBe('vue')
    expect(type.value).toBe('sources')
  })

  it('maps a legacy stars-sort value', () => {
    window.history.replaceState({}, '', '/?stars-sort=stars')
    applyQuery()
    expect(sort.value).toBe('most_stars')
  })

  it('sets galaxy view mode from stars-view=galaxy', () => {
    window.history.replaceState({}, '', '/?stars-view=galaxy')
    applyQuery()
    expect(viewMode.value).toBe('galaxy')
  })

  it('sets list view mode when stars-view is explicitly not "galaxy"', () => {
    window.history.replaceState({}, '', '/?stars-view=list')
    applyQuery()
    expect(viewMode.value).toBe('list')
  })

  it('collapses the galaxy area when stars-galaxy-expand is present but not "1"', () => {
    window.history.replaceState({}, '', '/?stars-galaxy-expand=0')
    applyQuery()
    expect(galaxyAreaExpanded.value).toBe(false)
  })

  it('reads the galaxy focus id from stars-focus', () => {
    window.history.replaceState({}, '', '/?stars-focus=abc')
    applyQuery()
    expect(galaxyFocus.value).toBe('abc')
  })

  it('sets uiLocale from the lang query param', () => {
    window.history.replaceState({}, '', '/?lang=en')
    applyQuery()
    expect(uiLocale.value).toBe('en')
  })

  it('expands the galaxy area from stars-galaxy-expand=1', () => {
    window.history.replaceState({}, '', '/?stars-galaxy-expand=1')
    applyQuery()
    expect(galaxyAreaExpanded.value).toBe(true)
  })

  it('does nothing when window is undefined', () => {
    const original = globalThis.window
    // @ts-expect-error -- simulating a non-browser environment
    globalThis.window = undefined
    expect(() => applyQuery()).not.toThrow()
    globalThis.window = original
  })
})
