import { afterEach, describe, expect, it } from 'bun:test'
import { clearFilterKey } from './clearFilterKey'
import { resetStateForTests } from './resetStateForTests'
import { qApplied, qInput, type } from './state'

describe('clearFilterKey', () => {
  afterEach(resetStateForTests)

  it('clears the type filter', () => {
    window.history.replaceState({}, '', '/')
    type.value = 'sources'
    clearFilterKey('type')
    expect(type.value).toBe('all')
  })

  it('clears the search query', () => {
    window.history.replaceState({}, '', '/')
    qInput.value = 'vue'
    qApplied.value = 'vue'
    clearFilterKey('q')
    expect(qInput.value).toBe('')
    expect(qApplied.value).toBe('')
  })

  it('leaves other filters alone for an unrecognized key', () => {
    window.history.replaceState({}, '', '/')
    qApplied.value = 'vue'
    clearFilterKey('language')
    expect(qApplied.value).toBe('vue')
  })
})
