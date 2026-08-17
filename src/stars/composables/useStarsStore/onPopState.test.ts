import { afterEach, describe, expect, it } from 'bun:test'
import { onPopState } from './onPopState'
import { resetStateForTests } from './resetStateForTests'
import { language } from './state'

describe('onPopState', () => {
  afterEach(resetStateForTests)

  it('re-applies filters from the current URL', () => {
    window.history.replaceState({}, '', '/?stars-lang=Rust')
    onPopState()
    expect(language.value).toBe('Rust')
  })
})
