import { describe, expect, it } from 'bun:test'
import { applyFieldFilament } from './applyFieldFilament'

describe('applyFieldFilament', () => {
  it('perturbs a position by a finite amount', () => {
    const [x, y, z] = applyFieldFilament(1, 0, 0, 0, 100)
    expect(Number.isFinite(x)).toBe(true)
    expect(Number.isFinite(y)).toBe(true)
    expect(Number.isFinite(z)).toBe(true)
  })
})
