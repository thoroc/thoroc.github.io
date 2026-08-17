import { describe, expect, it } from 'bun:test'
import { sampleEllipsoidVolume } from './sampleEllipsoidVolume'

describe('sampleEllipsoidVolume', () => {
  it('returns a finite local position and density', () => {
    const sample = sampleEllipsoidVolume(1, 1, 1, 1, 0.5)
    expect(Number.isFinite(sample.lx)).toBe(true)
    expect(Number.isFinite(sample.ly)).toBe(true)
    expect(Number.isFinite(sample.lz)).toBe(true)
    expect(sample.density).toBeGreaterThanOrEqual(0)
  })

  it('takes the pillar branch when requested', () => {
    const sample = sampleEllipsoidVolume(1, 1, 1, 1, 0.5, true)
    expect(Number.isFinite(sample.lx)).toBe(true)
  })
})
