import { describe, expect, it } from 'bun:test'
import { computeGalaxyLayout } from './compute-galaxy-layout'

describe('computeGalaxyLayout', () => {
  it('returns an empty, anchor-less layout for no items', () => {
    const layout = computeGalaxyLayout([])
    expect(layout.anchorId).toBeNull()
    expect(layout.positions.length).toBe(0)
  })

  it('returns an empty layout when items is null/undefined', () => {
    const layout = computeGalaxyLayout(null)
    expect(layout.anchorId).toBeNull()
  })

  it('computes a layout with a resolved anchor for a starred item', () => {
    const layout = computeGalaxyLayout([
      {
        id: 'owner-repo',
        fullName: 'owner/repo',
        language: 'TypeScript',
        stars: 10,
        starredAt: '2026-01-01T00:00:00Z',
      },
    ])
    expect(layout.anchorId).toBe('owner-repo')
    expect(layout.positions.length).toBeGreaterThan(0)
  })

  it('resolves no anchor id when no item has an id', () => {
    const layout = computeGalaxyLayout([
      {
        fullName: 'owner/repo',
        language: 'TypeScript',
        stars: 10,
      },
    ])
    expect(layout.anchorId).toBeNull()
  })
})
