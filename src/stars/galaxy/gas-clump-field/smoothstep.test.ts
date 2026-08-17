import { describe, expect, it } from 'bun:test'
import { smoothstep } from './smoothstep'

describe('smoothstep', () => {
  it('returns 0 below the lower edge and 1 above the upper edge', () => {
    expect(smoothstep(0, 1, -1)).toBe(0)
    expect(smoothstep(0, 1, 2)).toBe(1)
  })

  it('eases smoothly between the edges', () => {
    expect(smoothstep(0, 1, 0.5)).toBe(0.5)
  })
})
