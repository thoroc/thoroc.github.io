import { describe, expect, it } from 'bun:test'
import { galaxyRadiusForLanguage } from './galaxyRadiusForLanguage'

describe('galaxyRadiusForLanguage', () => {
  it('returns a larger radius for a language with a bigger share', () => {
    const layout = {
      langCounts: new Map([
        ['TypeScript', 90],
        ['Rust', 10],
      ]),
    }
    const big = galaxyRadiusForLanguage('TypeScript', layout, 100)
    const small = galaxyRadiusForLanguage('Rust', layout, 100)
    expect(big).toBeGreaterThan(small)
  })

  it('defaults to a count of 1 when the language is unknown', () => {
    const layout = { langCounts: new Map() }
    expect(
      Number.isFinite(galaxyRadiusForLanguage('Unknown', layout, 100)),
    ).toBe(true)
  })
})
