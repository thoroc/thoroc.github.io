import { describe, expect, it } from 'bun:test'
import { GALAXY_LAYOUT_VERSION } from './constants'
import { isSerializableGalaxyLayout } from './isSerializableGalaxyLayout'

describe('isSerializableGalaxyLayout', () => {
  it('delegates to the same validity check', () => {
    expect(
      isSerializableGalaxyLayout({
        version: GALAXY_LAYOUT_VERSION,
        positions: [1, 2, 3],
      }),
    ).toBe(true)
    expect(isSerializableGalaxyLayout(null)).toBe(false)
  })
})
