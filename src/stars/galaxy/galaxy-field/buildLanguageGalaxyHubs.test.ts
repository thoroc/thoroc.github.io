import { describe, expect, it } from 'bun:test'
import { buildLanguageGalaxyHubs } from './buildLanguageGalaxyHubs'

describe('buildLanguageGalaxyHubs', () => {
  it('returns a hub position per language', () => {
    const layout = {
      languages: ['TypeScript', 'Rust'],
      langCounts: new Map([
        ['TypeScript', 40],
        ['Rust', 20],
      ]),
    }
    const hubs = buildLanguageGalaxyHubs(layout)
    expect(hubs.size).toBe(2)
    expect(hubs.get('TypeScript')).toHaveLength(3)
  })
})
