import { describe, expect, it } from 'bun:test'
import { placeOpenClusterStar } from './placeOpenClusterStar'

describe('placeOpenClusterStar', () => {
  it('writes a finite position blended between the cluster and repo anchor', () => {
    const positions = new Float32Array(3)
    placeOpenClusterStar(
      { virtualKey: 'a:cli', repoId: 'a', topic: 'cli' },
      [1, 2, 3],
      [4, 5, 6, 2],
      2,
      positions,
      0,
      1,
    )
    expect(Number.isFinite(positions[0])).toBe(true)
    expect(Number.isFinite(positions[1])).toBe(true)
    expect(Number.isFinite(positions[2])).toBe(true)
  })
})
