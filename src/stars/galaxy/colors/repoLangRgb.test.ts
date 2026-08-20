import { describe, expect, it } from 'bun:test'
import { OTHER_LANGUAGE_KEY } from '../../utils/other-language'
import { repoLangRgb } from './repoLangRgb'

describe('repoLangRgb', () => {
  it('returns a normalised rgb triple for a known language', () => {
    const [r, g, b] = repoLangRgb('TypeScript')
    expect(r).toBeGreaterThanOrEqual(0)
    expect(r).toBeLessThanOrEqual(1)
    expect(g).toBeGreaterThanOrEqual(0)
    expect(g).toBeLessThanOrEqual(1)
    expect(b).toBeGreaterThanOrEqual(0)
    expect(b).toBeLessThanOrEqual(1)
  })

  it('falls back to a default language when none is given', () => {
    expect(repoLangRgb(null)).toEqual(repoLangRgb(OTHER_LANGUAGE_KEY))
  })
})
