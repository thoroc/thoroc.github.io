import { describe, expect, it } from 'bun:test'
import { buildLanguageLayout } from '../repo-position'
import { buildHarmonizedRawLanguageHubs } from './buildHarmonizedRawLanguageHubs'

describe('buildHarmonizedRawLanguageHubs', () => {
  it('returns null without a harmonizeMeta', () => {
    const layout = buildLanguageLayout([{ language: 'TypeScript' }])
    expect(buildHarmonizedRawLanguageHubs(layout, null)).toBeNull()
  })

  it('harmonizes raw hubs by the given center and scale', () => {
    const layout = buildLanguageLayout([{ language: 'TypeScript' }])
    const hubs = buildHarmonizedRawLanguageHubs(layout, {
      cx: 1,
      cy: 2,
      cz: 3,
      scale: 2,
      yFlatten: 0.5,
    })
    expect(hubs?.size).toBeGreaterThan(0)
    for (const [x, y, z] of hubs?.values() ?? []) {
      expect(Number.isFinite(x)).toBe(true)
      expect(Number.isFinite(y)).toBe(true)
      expect(Number.isFinite(z)).toBe(true)
    }
  })
})
