import { afterEach, describe, expect, it } from 'bun:test'
import { collapseDescExpanded } from './collapseDescExpanded'
import { resetStateForTests } from './resetStateForTests'
import { expandedDescIds } from './state'

describe('collapseDescExpanded', () => {
  afterEach(resetStateForTests)

  it('removes an expanded id', () => {
    expandedDescIds.value = new Set(['a'])
    collapseDescExpanded('a')
    expect(expandedDescIds.value.has('a')).toBe(false)
  })

  it('does nothing when the id is not expanded', () => {
    const original = expandedDescIds.value
    collapseDescExpanded('a')
    expect(expandedDescIds.value).toBe(original)
  })
})
