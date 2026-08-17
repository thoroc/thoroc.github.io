import { describe, expect, it } from 'bun:test'
import { buildLanguageLayout } from '../repo-position'
import { fillGasMotionFields } from './fillGasMotionFields'
import type { GasBuffersLike } from './types'

describe('fillGasMotionFields', () => {
  it('does nothing when gasBuffers has no count', () => {
    const gasBuffers = { count: 0 }
    fillGasMotionFields(gasBuffers, buildLanguageLayout([]), new Map())
    expect(gasBuffers.count).toBe(0)
  })

  it('does nothing for a null/undefined gasBuffers', () => {
    expect(() =>
      fillGasMotionFields(null, buildLanguageLayout([]), new Map()),
    ).not.toThrow()
  })

  it('fills motion fields for each language layer', () => {
    const layout = buildLanguageLayout([{ language: 'TypeScript' }])
    const gasBuffers: GasBuffersLike = {
      count: 2,
      languages: ['TypeScript'],
      perGalaxy: 1,
      corePerGalaxy: 1,
    }
    const hubs = new Map<string, [number, number, number]>([
      ['TypeScript', [1, 2, 3]],
    ])
    fillGasMotionFields(gasBuffers, layout, hubs)
    expect(gasBuffers.galaxyHubs?.length).toBe(6)
    expect(gasBuffers.motionOmega?.length).toBe(8)
    expect(gasBuffers.motionOmega2?.length).toBe(8)
    expect(gasBuffers.langMotions?.length).toBe(1)
  })
})
