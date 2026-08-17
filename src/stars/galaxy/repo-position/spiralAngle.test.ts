import { describe, expect, it } from 'bun:test'
import { spiralAngle } from './spiralAngle'

describe('spiralAngle', () => {
  it('returns a finite angle', () => {
    const angle = spiralAngle(1, 10, 0.1, 0.2, 0.3)
    expect(Number.isFinite(angle)).toBe(true)
  })
})
