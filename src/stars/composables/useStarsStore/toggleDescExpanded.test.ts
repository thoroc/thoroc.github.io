import { afterEach, describe, expect, it } from 'bun:test'
import { resetStateForTests } from './resetStateForTests'
import { expandedDescIds } from './state'
import { toggleDescExpanded } from './toggleDescExpanded'

describe('toggleDescExpanded', () => {
  afterEach(resetStateForTests)

  it('adds an id not yet expanded', () => {
    toggleDescExpanded('a')
    expect(expandedDescIds.value.has('a')).toBe(true)
  })

  it('removes an id already expanded', () => {
    expandedDescIds.value = new Set(['a'])
    toggleDescExpanded('a')
    expect(expandedDescIds.value.has('a')).toBe(false)
  })

  it('replaces the set rather than mutating it in place', () => {
    const original = expandedDescIds.value
    toggleDescExpanded('a')
    expect(expandedDescIds.value).not.toBe(original)
  })
})
