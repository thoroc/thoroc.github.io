import { describe, expect, it } from 'bun:test'
import { buildCosmicLanguageField } from './buildCosmicLanguageField'

describe('buildCosmicLanguageField', () => {
  it('builds one kernel per language', () => {
    const layout = {
      languages: ['TypeScript', 'Rust'],
      langCounts: new Map([
        ['TypeScript', 40],
        ['Rust', 20],
      ]),
    }
    const field = buildCosmicLanguageField(layout, 60)
    expect(field.kernels.size).toBe(2)
    expect(field.kernels.has('TypeScript')).toBe(true)
    expect(field.span).toBeGreaterThan(0)
    expect(field.coreR).toBeGreaterThan(0)
  })

  it('returns an empty kernel map for no languages', () => {
    const field = buildCosmicLanguageField({ languages: [] })
    expect(field.kernels.size).toBe(0)
  })
})
