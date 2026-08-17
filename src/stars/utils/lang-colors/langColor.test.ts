import { describe, expect, it } from 'bun:test'
import { langColor } from './langColor'

describe('langColor', () => {
  it('returns the default grey for falsy or "all"', () => {
    expect(langColor(null)).toBe('#8b949e')
    expect(langColor(undefined)).toBe('#8b949e')
    expect(langColor('')).toBe('#8b949e')
    expect(langColor('all')).toBe('#8b949e')
  })

  it('returns the mapped color for a known language', () => {
    expect(langColor('TypeScript')).toBe('#3178c6')
    expect(langColor('Rust')).toBe('#dea584')
  })

  it('returns the fallback color for an unknown language', () => {
    expect(langColor('COBOL')).toBe('#6e7681')
  })
})
