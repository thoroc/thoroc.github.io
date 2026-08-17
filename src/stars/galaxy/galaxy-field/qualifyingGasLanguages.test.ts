import { describe, expect, it } from 'bun:test'
import { qualifyingGasLanguages } from './qualifyingGasLanguages'

describe('qualifyingGasLanguages', () => {
  it('returns an empty array when there are no languages', () => {
    expect(qualifyingGasLanguages({ languages: [] })).toEqual([])
  })

  it('ranks languages by count, tie-broken alphabetically', () => {
    const layout = {
      languages: ['Rust', 'TypeScript', 'Go'],
      langCounts: new Map([
        ['TypeScript', 40],
        ['Rust', 20],
        ['Go', 20],
      ]),
    }
    const ranked = qualifyingGasLanguages(layout)
    expect(ranked[0]).toBe('TypeScript')
  })
})
