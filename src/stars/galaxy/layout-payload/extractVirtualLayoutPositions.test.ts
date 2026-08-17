import { describe, expect, it } from 'bun:test'
import { buildGalaxyVirtualIndexMap } from './buildGalaxyVirtualIndexMap'
import { GALAXY_LAYOUT_VERSION } from './constants'
import { extractVirtualLayoutPositions } from './extractVirtualLayoutPositions'

const validLayout = {
  version: GALAXY_LAYOUT_VERSION,
  anchorId: 'repo-a',
  positions: [1, 2, 3, 4, 5, 6],
}

describe('extractVirtualLayoutPositions', () => {
  it('returns null for an invalid layout', () => {
    expect(
      extractVirtualLayoutPositions(
        [],
        { version: 1, positions: [] },
        new Map(),
      ),
    ).toBeNull()
  })

  it('returns null when the index map is empty', () => {
    expect(extractVirtualLayoutPositions([], validLayout, new Map())).toBeNull()
  })

  it('returns empty positions for no virtual stars', () => {
    const map = buildGalaxyVirtualIndexMap([{ virtualKey: 'a' }])
    expect(extractVirtualLayoutPositions([], validLayout, map)).toEqual({
      positions: new Float32Array(0),
      anchorIndex: -1,
    })
  })

  it('extracts positions and resolves the anchor index', () => {
    const virtualStars = [
      { virtualKey: 'a', repoId: 'repo-a' },
      { virtualKey: 'b', repoId: 'repo-b' },
    ]
    const map = buildGalaxyVirtualIndexMap(virtualStars)
    const result = extractVirtualLayoutPositions(virtualStars, validLayout, map)
    expect(result?.positions).toEqual(new Float32Array([1, 2, 3, 4, 5, 6]))
    expect(result?.anchorIndex).toBe(0)
  })

  it('returns null when a virtual key is missing from the index map', () => {
    const virtualStars = [{ virtualKey: 'missing', repoId: 'repo-a' }]
    const map = buildGalaxyVirtualIndexMap([{ virtualKey: 'a' }])
    expect(
      extractVirtualLayoutPositions(virtualStars, validLayout, map),
    ).toBeNull()
  })

  it('returns null when the resolved index is out of layout bounds', () => {
    const virtualStars = [{ virtualKey: 'a', repoId: 'repo-a' }]
    const map = new Map([['a', 5]])
    expect(
      extractVirtualLayoutPositions(virtualStars, validLayout, map),
    ).toBeNull()
  })

  it('returns null when a resolved position is non-finite', () => {
    const layout = {
      version: GALAXY_LAYOUT_VERSION,
      anchorId: 'repo-a',
      positions: [1, 2, Number.NaN],
    }
    const virtualStars = [{ virtualKey: 'a', repoId: 'repo-a' }]
    const map = buildGalaxyVirtualIndexMap(virtualStars)
    expect(extractVirtualLayoutPositions(virtualStars, layout, map)).toBeNull()
  })
})
