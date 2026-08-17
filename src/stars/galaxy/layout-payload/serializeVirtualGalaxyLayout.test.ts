import { describe, expect, it } from 'bun:test'
import { GALAXY_LAYOUT_VERSION } from './constants'
import { serializeVirtualGalaxyLayout } from './serializeVirtualGalaxyLayout'

describe('serializeVirtualGalaxyLayout', () => {
  it('returns an empty layout when there are no virtual stars', () => {
    expect(
      serializeVirtualGalaxyLayout([], [], new Float32Array(0), -1),
    ).toEqual({
      version: GALAXY_LAYOUT_VERSION,
      anchorId: null,
      positions: [],
    })
  })

  it('flattens and rounds positions, and resolves the anchor id', () => {
    const positions = new Float32Array([1.2345, 2.3456, 3.4567])
    const result = serializeVirtualGalaxyLayout(
      [{ id: 'repo-a' }],
      [{}],
      positions,
      0,
    )
    expect(result).toEqual({
      version: GALAXY_LAYOUT_VERSION,
      anchorId: 'repo-a',
      positions: [1.23, 2.35, 3.46],
    })
  })

  it('leaves anchorId null when the anchor index is out of range', () => {
    const positions = new Float32Array([1, 2, 3])
    const result = serializeVirtualGalaxyLayout(
      [{ id: 'repo-a' }],
      [{}],
      positions,
      -1,
    )
    expect(result.anchorId).toBeNull()
  })
})
