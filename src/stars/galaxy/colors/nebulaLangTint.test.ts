import { describe, expect, it } from 'bun:test'
import { nebulaLangTint } from './nebulaLangTint'

describe('nebulaLangTint', () => {
  it('scales up with density', () => {
    const lang: [number, number, number] = [0.5, 0.5, 0.5]
    const sparse = nebulaLangTint(lang, 0)
    const dense = nebulaLangTint(lang, 1)
    expect(dense[0]).toBeGreaterThan(sparse[0])
  })

  it('clamps channels to a maximum of 1', () => {
    const [r] = nebulaLangTint([1, 1, 1], 1)
    expect(r).toBeLessThanOrEqual(1)
  })
})
