import { afterEach, describe, expect, it } from 'bun:test'
import { patchStarredYearInQuery } from './patchStarredYearInQuery'
import { resetStateForTests } from './resetStateForTests'
import { starredYear } from './state'

describe('patchStarredYearInQuery', () => {
  afterEach(resetStateForTests)

  it('sets a given year value', () => {
    window.history.replaceState({}, '', '/')
    patchStarredYearInQuery('2026')
    expect(starredYear.value).toBe('2026')
  })

  it('normalizes a falsy or "all" value to "all"', () => {
    window.history.replaceState({}, '', '/')
    patchStarredYearInQuery('')
    expect(starredYear.value).toBe('all')
  })
})
