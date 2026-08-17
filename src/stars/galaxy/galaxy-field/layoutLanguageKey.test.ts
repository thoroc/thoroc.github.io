import { describe, expect, it } from 'bun:test'
import { layoutLanguageKey } from './layoutLanguageKey'

describe('layoutLanguageKey', () => {
  it('returns the language when it is a known key', () => {
    const layout = { langKeys: new Set(['TypeScript']) }
    expect(layoutLanguageKey({ language: 'TypeScript' }, layout)).toBe(
      'TypeScript',
    )
  })

  it('falls back to 其他 for unknown or missing languages', () => {
    const layout = { langKeys: new Set(['TypeScript']) }
    expect(layoutLanguageKey({ language: 'Rust' }, layout)).toBe('其他')
    expect(layoutLanguageKey({}, layout)).toBe('其他')
  })
})
