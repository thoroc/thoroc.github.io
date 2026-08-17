import { afterEach, describe, expect, it } from 'bun:test'
import { currentFilterState } from './currentFilterState'
import { resetStateForTests } from './resetStateForTests'
import { language, qApplied } from './state'

describe('currentFilterState', () => {
  afterEach(resetStateForTests)

  it('reads the current filter refs into a plain object', () => {
    qApplied.value = 'vue'
    language.value = 'Rust'
    expect(currentFilterState()).toEqual({
      q: 'vue',
      language: 'Rust',
      license: 'all',
      starredYear: 'all',
      type: 'all',
      sort: 'recently_starred',
    })
  })

  it('applies overrides on top of the current state', () => {
    language.value = 'Rust'
    expect(currentFilterState({ language: 'all' }).language).toBe('all')
  })
})
