import { afterEach, describe, expect, it } from 'bun:test'
import { persistSession } from './persistSession'
import { resetStateForTests } from './resetStateForTests'
import { language, qApplied, STARS_FILTERS_SESSION_KEY } from './state'

describe('persistSession', () => {
  afterEach(resetStateForTests)

  it('writes the current filter state to sessionStorage', () => {
    qApplied.value = 'vue'
    language.value = 'Rust'
    persistSession()
    const saved = JSON.parse(
      sessionStorage.getItem(STARS_FILTERS_SESSION_KEY) as string,
    )
    expect(saved.q).toBe('vue')
    expect(saved.language).toBe('Rust')
  })

  it('does not throw when sessionStorage.setItem fails', () => {
    const original = sessionStorage.setItem
    Object.defineProperty(sessionStorage, 'setItem', {
      value: () => {
        throw new Error('quota exceeded')
      },
      configurable: true,
    })
    expect(() => persistSession()).not.toThrow()
    Object.defineProperty(sessionStorage, 'setItem', {
      value: original,
      configurable: true,
    })
  })
})
