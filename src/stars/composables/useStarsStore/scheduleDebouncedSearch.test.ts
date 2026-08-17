import { afterEach, describe, expect, it } from 'bun:test'
import { resetStateForTests } from './resetStateForTests'
import { scheduleDebouncedSearch } from './scheduleDebouncedSearch'
import { qApplied, qInput, searchConfig } from './state'

const waitMs = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

describe('scheduleDebouncedSearch', () => {
  afterEach(resetStateForTests)

  it('applies the query after the debounce delay', async () => {
    window.history.replaceState({}, '', '/')
    searchConfig.debounceMs = 5
    qInput.value = 'vue'
    scheduleDebouncedSearch()
    expect(qApplied.value).toBe('')
    await waitMs(20)
    expect(qApplied.value).toBe('vue')
  })

  it('resets the timer on repeated calls, only applying once', async () => {
    window.history.replaceState({}, '', '/')
    searchConfig.debounceMs = 10
    qInput.value = 'a'
    scheduleDebouncedSearch()
    qInput.value = 'ab'
    scheduleDebouncedSearch()
    await waitMs(30)
    expect(qApplied.value).toBe('ab')
  })
})
