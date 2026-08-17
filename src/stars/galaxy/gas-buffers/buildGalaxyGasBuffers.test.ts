import { describe, expect, it } from 'bun:test'
import { COSMIC_UNIVERSE } from '../constants'
import { buildGalaxyGasBuffers } from './buildGalaxyGasBuffers'

const layout = {
  spreadFactor: 1,
  languages: ['TypeScript', 'Rust'],
  langCounts: new Map([
    ['TypeScript', 40],
    ['Rust', 20],
  ]),
}

describe('buildGalaxyGasBuffers', () => {
  it('builds non-empty buffers when qualifying languages exist', () => {
    const result = buildGalaxyGasBuffers(layout, new Array(60).fill({}))
    expect(result.count).toBeGreaterThan(0)
    expect(result.positions.length).toBe(result.count * 3)
    expect(result.languages.length).toBeGreaterThan(0)
    expect(result.langRadii.length).toBe(result.languages.length)
  })

  it('still emits field particles when there are no qualifying languages', () => {
    const result = buildGalaxyGasBuffers({ spreadFactor: 1, languages: [] }, [])
    expect(result.languages).toEqual([])
    expect(result.fieldGasStart).toBe(0)
    expect(result.count).toBe(result.fieldGasCount ?? -1)
  })

  it('returns an empty buffer set when nothing at all qualifies to be emitted', () => {
    const originalFieldGas = COSMIC_UNIVERSE.FIELD_GAS_COUNT
    COSMIC_UNIVERSE.FIELD_GAS_COUNT = 0
    try {
      const result = buildGalaxyGasBuffers(
        { spreadFactor: 1, languages: [] },
        [],
      )
      expect(result.count).toBe(0)
      expect(result.positions.length).toBe(0)
    } finally {
      COSMIC_UNIVERSE.FIELD_GAS_COUNT = originalFieldGas
    }
  })
})
