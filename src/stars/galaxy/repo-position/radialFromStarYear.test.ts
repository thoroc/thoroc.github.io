import { describe, expect, it } from 'bun:test'
import { radialFromStarYear } from './radialFromStarYear'

describe('radialFromStarYear', () => {
  it('places a more recently starred repo at a different radius', () => {
    const recent = radialFromStarYear('2024-01-01')
    const old = radialFromStarYear('2010-01-01')
    expect(recent).not.toBe(old)
  })
})
