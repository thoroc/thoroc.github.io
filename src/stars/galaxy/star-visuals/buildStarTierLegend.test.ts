import { describe, expect, it } from 'bun:test'
import { buildStarTierLegend } from './buildStarTierLegend'

describe('buildStarTierLegend', () => {
  it('buckets repos by star tier and drops empty tiers', () => {
    const legend = buildStarTierLegend([
      { stars: 60000 },
      { stars: 500 },
      { stars: 500 },
    ])
    expect(legend).toEqual([
      { key: '50k+', min: 50000, count: 1 },
      { key: '<1k', min: 0, count: 2 },
    ])
  })

  it('returns an empty array for no items', () => {
    expect(buildStarTierLegend(undefined)).toEqual([])
  })
})
