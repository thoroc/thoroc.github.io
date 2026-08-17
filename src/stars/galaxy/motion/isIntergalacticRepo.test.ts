import { describe, expect, it } from 'bun:test'
import { isIntergalacticRepo } from './isIntergalacticRepo'

describe('isIntergalacticRepo', () => {
  it('returns a boolean deterministically for a repo id', () => {
    const a = isIntergalacticRepo('repo-a')
    const b = isIntergalacticRepo('repo-a')
    expect(typeof a).toBe('boolean')
    expect(a).toBe(b)
  })
})
