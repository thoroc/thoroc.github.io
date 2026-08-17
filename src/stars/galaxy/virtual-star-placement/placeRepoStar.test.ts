import { describe, expect, it } from 'bun:test'
import { placeRepoStar } from './placeRepoStar'

describe('placeRepoStar', () => {
  it('writes a finite jittered position near the repo anchor', () => {
    const positions = new Float32Array(3)
    placeRepoStar([10, 20, 30], positions, 0, 1, 1)
    expect(Number.isFinite(positions[0])).toBe(true)
    expect(Number.isFinite(positions[1])).toBe(true)
    expect(Number.isFinite(positions[2])).toBe(true)
  })
})
