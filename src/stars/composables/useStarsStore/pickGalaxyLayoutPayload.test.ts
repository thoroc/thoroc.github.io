import { describe, expect, it } from 'bun:test'
import { GALAXY_LAYOUT_VERSION } from '../../galaxy/layout-payload'
import { pickGalaxyLayoutPayload } from './pickGalaxyLayoutPayload'

describe('pickGalaxyLayoutPayload', () => {
  it('returns null for an invalid layout', () => {
    expect(pickGalaxyLayoutPayload(null)).toBeNull()
    expect(
      pickGalaxyLayoutPayload({ version: 0, anchorId: null, positions: [] }),
    ).toBeNull()
  })

  it('returns the layout when it is valid', () => {
    const layout = {
      version: GALAXY_LAYOUT_VERSION,
      anchorId: null,
      positions: [1, 2, 3],
    }
    expect(pickGalaxyLayoutPayload(layout)).toEqual(layout)
  })
})
