import { describe, expect, it } from 'bun:test'
import { GALAXY_LAYOUT_VERSION } from './constants'
import { hasValidGalaxyLayout } from './hasValidGalaxyLayout'

describe('hasValidGalaxyLayout', () => {
  it('rejects a mismatched version', () => {
    expect(hasValidGalaxyLayout({ version: 1, positions: [1, 2, 3] })).toBe(
      false,
    )
  })

  it('rejects non-array or too-short positions', () => {
    expect(
      hasValidGalaxyLayout({ version: GALAXY_LAYOUT_VERSION, positions: [1] }),
    ).toBe(false)
  })

  it('rejects a positions length not divisible by 3', () => {
    expect(
      hasValidGalaxyLayout({
        version: GALAXY_LAYOUT_VERSION,
        positions: [1, 2, 3, 4],
      }),
    ).toBe(false)
  })

  it('rejects layouts with too many non-finite positions', () => {
    expect(
      hasValidGalaxyLayout({
        version: GALAXY_LAYOUT_VERSION,
        positions: [1, 2, Number.NaN],
      }),
    ).toBe(false)
  })

  it('accepts a valid layout', () => {
    expect(
      hasValidGalaxyLayout({
        version: GALAXY_LAYOUT_VERSION,
        positions: [1, 2, 3, 4, 5, 6],
      }),
    ).toBe(true)
  })
})
