import { describe, expect, it } from 'bun:test'
import { blendCosmicColor } from './blendCosmicColor'

describe('blendCosmicColor', () => {
  it('weights language colour by langMix', () => {
    const lang: [number, number, number] = [1, 0, 0]
    const stellar: [number, number, number] = [0, 0, 1]
    const [r, , b] = blendCosmicColor(lang, stellar, 1)
    expect(r).toBeGreaterThan(b)
  })

  it('clamps langMix to a maximum of 0.88', () => {
    const lang: [number, number, number] = [1, 0, 0]
    const stellar: [number, number, number] = [0, 0, 1]
    const clamped = blendCosmicColor(lang, stellar, 1)
    const atCap = blendCosmicColor(lang, stellar, 0.88)
    expect(clamped).toEqual(atCap)
  })
})
