import { describe, expect, it } from 'bun:test'
import { sampleFilamentParticle } from './sampleFilamentParticle'
import type { GasClump } from './types'

const clump: GasClump = {
  cx: 0,
  cy: 0,
  cz: 0,
  rx: 10,
  ry: 5,
  rz: 8,
  tiltX: 0,
  tiltY: 0,
  tiltZ: 0,
  weight: 1,
  filDx: 1,
  filDy: 0,
  filDz: 0,
  pillar: false,
}

describe('sampleFilamentParticle', () => {
  it('returns a finite local position, density, and stretch', () => {
    const sample = sampleFilamentParticle(1, clump)
    expect(Number.isFinite(sample.lx)).toBe(true)
    expect(Number.isFinite(sample.ly)).toBe(true)
    expect(Number.isFinite(sample.lz)).toBe(true)
    expect(sample.density).toBeGreaterThanOrEqual(0)
    expect(sample.stretch).toBeGreaterThan(0)
  })
})
