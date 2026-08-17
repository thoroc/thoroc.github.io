import { describe, expect, it } from 'bun:test'
import { mapInfluenceToRange } from './mapInfluenceToRange'

const range = { MIN: 1, MAX: 5, GAMMA: 1 }

describe('mapInfluenceToRange', () => {
  it('maps 0 to MIN and 1 to MAX', () => {
    expect(mapInfluenceToRange(0, range)).toBe(1)
    expect(mapInfluenceToRange(1, range)).toBe(5)
  })

  it('clamps out-of-range influence', () => {
    expect(mapInfluenceToRange(-1, range)).toBe(1)
    expect(mapInfluenceToRange(2, range)).toBe(5)
  })
})
