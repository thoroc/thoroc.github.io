import { afterEach, describe, expect, it } from 'bun:test'
import { isDescExpanded } from './isDescExpanded'
import { resetStateForTests } from './resetStateForTests'
import { expandedDescIds } from './state'

describe('isDescExpanded', () => {
  afterEach(resetStateForTests)

  it('returns false for an id not in the expanded set', () => {
    expect(isDescExpanded('a')).toBe(false)
  })

  it('returns true for an id in the expanded set', () => {
    expandedDescIds.value = new Set(['a'])
    expect(isDescExpanded('a')).toBe(true)
  })
})
