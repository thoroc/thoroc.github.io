import { afterEach, describe, expect, it } from 'bun:test'
import { patchLanguageInQuery } from './patchLanguageInQuery'
import { resetStateForTests } from './resetStateForTests'
import { language } from './state'

describe('patchLanguageInQuery', () => {
  afterEach(resetStateForTests)

  it('sets a given language value', () => {
    window.history.replaceState({}, '', '/')
    patchLanguageInQuery('Rust')
    expect(language.value).toBe('Rust')
  })

  it('normalizes a falsy or "all" value to "all"', () => {
    window.history.replaceState({}, '', '/')
    patchLanguageInQuery(null)
    expect(language.value).toBe('all')
    patchLanguageInQuery('all')
    expect(language.value).toBe('all')
  })
})
