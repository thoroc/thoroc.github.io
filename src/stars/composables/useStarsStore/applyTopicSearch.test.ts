import { afterEach, describe, expect, it } from 'bun:test'
import { applyTopicSearch } from './applyTopicSearch'
import { resetStateForTests } from './resetStateForTests'
import { qApplied, qInput } from './state'

describe('applyTopicSearch', () => {
  afterEach(resetStateForTests)

  it('sets the search query to a #topic tag, lowercased', () => {
    window.history.replaceState({}, '', '/')
    applyTopicSearch('Vue')
    expect(qInput.value).toBe('#vue')
    expect(qApplied.value).toBe('#vue')
  })

  it('does nothing for a blank topic', () => {
    window.history.replaceState({}, '', '/')
    applyTopicSearch('   ')
    expect(qInput.value).toBe('')
  })

  it('does not throw when window is undefined', () => {
    const original = globalThis.window
    // @ts-expect-error -- simulating a non-browser environment
    globalThis.window = undefined
    expect(() => applyTopicSearch('vue')).not.toThrow()
    globalThis.window = original
  })
})
