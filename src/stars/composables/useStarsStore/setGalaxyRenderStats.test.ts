import { afterEach, describe, expect, it } from 'bun:test'
import { resetStateForTests } from './resetStateForTests'
import { setGalaxyRenderStats } from './setGalaxyRenderStats'
import { galaxyRenderStats } from './state'

describe('setGalaxyRenderStats', () => {
  afterEach(resetStateForTests)

  it('normalizes stats from a well-formed input', () => {
    setGalaxyRenderStats({
      layoutVersion: 3,
      pointCount: 500,
      precomputed: true,
    })
    expect(galaxyRenderStats.value).toEqual({
      layoutVersion: 3,
      pointCount: 500,
      precomputed: true,
    })
  })

  it('defaults to zero/false for null or missing fields', () => {
    setGalaxyRenderStats(null)
    expect(galaxyRenderStats.value).toEqual({
      layoutVersion: 0,
      pointCount: 0,
      precomputed: false,
    })
  })

  it('coerces non-numeric fields to 0', () => {
    setGalaxyRenderStats({ layoutVersion: 'x', pointCount: undefined })
    expect(galaxyRenderStats.value.layoutVersion).toBe(0)
    expect(galaxyRenderStats.value.pointCount).toBe(0)
  })
})
