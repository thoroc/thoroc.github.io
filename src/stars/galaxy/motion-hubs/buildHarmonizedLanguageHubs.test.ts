import { describe, expect, it } from 'bun:test'
import { buildLanguageLayout } from '../repo-position'
import { buildHarmonizedLanguageHubs } from './buildHarmonizedLanguageHubs'

describe('buildHarmonizedLanguageHubs', () => {
  it('computes the centroid position per language', () => {
    const layout = buildLanguageLayout([
      { language: 'TypeScript' },
      { language: 'TypeScript' },
    ])
    const virtualStars = [
      {
        virtualKey: 'a',
        repoId: 'a',
        item: {},
        language: 'TypeScript',
        topic: null,
      },
      {
        virtualKey: 'b',
        repoId: 'b',
        item: {},
        language: 'TypeScript',
        topic: null,
      },
    ]
    const positions = new Float32Array([0, 0, 0, 2, 0, 0])
    const hubs = buildHarmonizedLanguageHubs(layout, virtualStars, positions, 2)
    expect(hubs.get('TypeScript')).toEqual([1, 0, 0])
  })
})
