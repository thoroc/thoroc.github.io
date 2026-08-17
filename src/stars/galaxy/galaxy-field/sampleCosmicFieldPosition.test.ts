import { describe, expect, it } from 'bun:test'
import { buildCosmicLanguageField } from './buildCosmicLanguageField'
import { sampleCosmicFieldPosition } from './sampleCosmicFieldPosition'

const layout = {
  languages: ['TypeScript', 'Rust'],
  langKeys: new Set(['TypeScript', 'Rust']),
  langCounts: new Map([
    ['TypeScript', 40],
    ['Rust', 20],
  ]),
}

describe('sampleCosmicFieldPosition', () => {
  it('samples a finite position blended with a secondary kernel', () => {
    const field = buildCosmicLanguageField(layout, 60)
    const [x, y, z] = sampleCosmicFieldPosition(
      { language: 'TypeScript' },
      1,
      field,
      layout,
    )
    expect(Number.isFinite(x)).toBe(true)
    expect(Number.isFinite(y)).toBe(true)
    expect(Number.isFinite(z)).toBe(true)
  })

  it('returns the origin when the field has no kernels', () => {
    const emptyField = buildCosmicLanguageField({ languages: [] })
    expect(
      sampleCosmicFieldPosition({ language: 'TypeScript' }, 1, emptyField, {
        languages: [],
      }),
    ).toEqual([0, 0, 0])
  })
})
