import { describe, expect, it } from 'bun:test'
import { computeGalaxyLayoutForItems } from './computeGalaxyLayoutForItems'
import type { NormalizedStarItem } from './types'

const item = (
  overrides: Partial<NormalizedStarItem> = {},
): NormalizedStarItem => ({
  id: 'owner-repo',
  fullName: 'owner/repo',
  description: '',
  language: 'TypeScript',
  license: null,
  licenseUrl: null,
  stars: 5,
  starredAt: '2026-01-01T00:00:00Z',
  createdAt: '',
  pushedAt: '',
  homepage: null,
  forksCount: 0,
  watchersCount: 0,
  topics: [],
  fork: false,
  isTemplate: false,
  ...overrides,
})

describe('computeGalaxyLayoutForItems', () => {
  it('returns null for an empty item list', async () => {
    expect(await computeGalaxyLayoutForItems([])).toBeNull()
  })

  it('computes a layout for a non-empty item list', async () => {
    const layout = await computeGalaxyLayoutForItems([item()])
    expect(layout).not.toBeNull()
    expect(layout?.positions.length).toBeGreaterThan(0)
  })
})
