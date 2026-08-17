import { afterEach, describe, expect, it } from 'bun:test'
import { onSearch } from './onSearch'
import { resetStateForTests } from './resetStateForTests'
import { qApplied, qInput } from './state'

describe('onSearch', () => {
  afterEach(resetStateForTests)

  it('applies the input query immediately', () => {
    window.history.replaceState({}, '', '/')
    qInput.value = 'vue'
    onSearch()
    expect(qApplied.value).toBe('vue')
  })
})
