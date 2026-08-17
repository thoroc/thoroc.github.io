import { afterEach, describe, expect, it } from 'bun:test'
import { ref } from 'vue'
import { patchQueryParam } from './patchQueryParam'
import { resetStateForTests } from './resetStateForTests'

describe('patchQueryParam', () => {
  afterEach(resetStateForTests)

  it('sets the query param and leaves the ref value as-is when non-default', () => {
    window.history.replaceState({}, '', '/')
    const valueRef = ref('Rust')
    patchQueryParam('stars-lang', valueRef)
    expect(new URLSearchParams(window.location.search).get('stars-lang')).toBe(
      'Rust',
    )
    expect(valueRef.value).toBe('Rust')
  })

  it('deletes the query param and resets the ref to the "all" default', () => {
    window.history.replaceState({}, '', '/?stars-lang=Rust')
    const valueRef = ref('all')
    patchQueryParam('stars-lang', valueRef)
    expect(new URLSearchParams(window.location.search).has('stars-lang')).toBe(
      false,
    )
    expect(valueRef.value).toBe('all')
  })

  it('does nothing when window is undefined', () => {
    const original = globalThis.window
    // @ts-expect-error -- simulating a non-browser environment
    globalThis.window = undefined
    const valueRef = ref('Rust')
    expect(() => patchQueryParam('stars-lang', valueRef)).not.toThrow()
    globalThis.window = original
  })
})
