import { describe, expect, it } from 'bun:test'
import { buildLanguageLayout } from './buildLanguageLayout'
import { repoPosition } from './repoPosition'

describe('repoPosition', () => {
  it('returns a finite position without a layout', () => {
    const [x, y, z] = repoPosition({ id: 'a', stars: 10 }, 100)
    expect(Number.isFinite(x)).toBe(true)
    expect(Number.isFinite(y)).toBe(true)
    expect(Number.isFinite(z)).toBe(true)
  })

  it('returns a finite position with a language layout', () => {
    const layout = buildLanguageLayout([{ language: 'TypeScript' }])
    const [x, y, z] = repoPosition(
      { id: 'a', language: 'TypeScript', stars: 10, topics: ['cli'] },
      100,
      layout,
    )
    expect(Number.isFinite(x)).toBe(true)
    expect(Number.isFinite(y)).toBe(true)
    expect(Number.isFinite(z)).toBe(true)
  })

  it('is deterministic for the same repo id', () => {
    const a = repoPosition({ id: 'a', stars: 10 }, 100)
    const b = repoPosition({ id: 'a', stars: 10 }, 100)
    expect(a).toEqual(b)
  })
})
