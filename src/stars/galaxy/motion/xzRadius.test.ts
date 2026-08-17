import { describe, expect, it } from 'bun:test'
import { xzRadius } from './xzRadius'

describe('xzRadius', () => {
  it('computes the hypotenuse of x and z', () => {
    expect(xzRadius(3, 4)).toBe(5)
  })
})
