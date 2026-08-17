import { describe, expect, it } from 'bun:test'
import { buildLanguageHubMotion } from './buildLanguageHubMotion'

describe('buildLanguageHubMotion', () => {
  it('returns finite motion parameters for a hub', () => {
    const m = buildLanguageHubMotion(null, 'TypeScript', [10, 0, 5])
    expect(Number.isFinite(m.universeOrbit)).toBe(true)
    expect(Number.isFinite(m.galaxySpin)).toBe(true)
    expect(Number.isFinite(m.galaxyOrbit)).toBe(true)
    expect(Number.isFinite(m.tiltMix)).toBe(true)
  })

  it('is deterministic for the same language and hub', () => {
    const a = buildLanguageHubMotion(null, 'Rust', [1, 2, 3])
    const b = buildLanguageHubMotion(null, 'Rust', [1, 2, 3])
    expect(a).toEqual(b)
  })
})
