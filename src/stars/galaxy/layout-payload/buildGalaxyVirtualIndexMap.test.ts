import { describe, expect, it } from 'bun:test'
import { buildGalaxyVirtualIndexMap } from './buildGalaxyVirtualIndexMap'

describe('buildGalaxyVirtualIndexMap', () => {
  it('maps each virtualKey to its index', () => {
    const map = buildGalaxyVirtualIndexMap([
      { virtualKey: 'a' },
      { virtualKey: 'b' },
    ])
    expect(map.get('a')).toBe(0)
    expect(map.get('b')).toBe(1)
  })

  it('returns an empty map for no input', () => {
    expect(buildGalaxyVirtualIndexMap([]).size).toBe(0)
  })
})
