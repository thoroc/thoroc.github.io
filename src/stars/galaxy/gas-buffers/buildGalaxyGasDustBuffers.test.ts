import { describe, expect, it } from 'bun:test'
import { COSMIC_UNIVERSE } from '../constants'
import { buildGalaxyGasDustBuffers } from './buildGalaxyGasDustBuffers'

const layout = {
  spreadFactor: 1,
  languages: ['TypeScript', 'Rust'],
  langCounts: new Map([
    ['TypeScript', 40],
    ['Rust', 20],
  ]),
}

describe('buildGalaxyGasDustBuffers', () => {
  it('builds non-empty dust buffers when qualifying languages exist', () => {
    const result = buildGalaxyGasDustBuffers(layout, new Array(60).fill({}))
    expect(result.count).toBeGreaterThan(0)
    expect(result.positions.length).toBe(result.count * 3)
    expect(result.languages.length).toBeGreaterThan(0)
  })

  it('still emits field dust particles when there are no qualifying languages', () => {
    const result = buildGalaxyGasDustBuffers(
      { spreadFactor: 1, languages: [] },
      [],
    )
    expect(result.languages).toEqual([])
    expect(result.fieldDustStart).toBe(0)
    expect(result.count).toBe(result.fieldDustCount)
  })

  it('returns an empty buffer set when nothing at all qualifies to be emitted', () => {
    const originalFieldDust = COSMIC_UNIVERSE.FIELD_DUST_COUNT
    COSMIC_UNIVERSE.FIELD_DUST_COUNT = 0
    try {
      const result = buildGalaxyGasDustBuffers(
        { spreadFactor: 1, languages: [] },
        [],
      )
      expect(result.count).toBe(0)
      expect(result.positions.length).toBe(0)
    } finally {
      COSMIC_UNIVERSE.FIELD_DUST_COUNT = originalFieldDust
    }
  })
})
