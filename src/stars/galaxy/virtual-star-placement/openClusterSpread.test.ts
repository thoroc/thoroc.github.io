import { describe, expect, it } from 'bun:test'
import { openClusterSpread } from './openClusterSpread'

describe('openClusterSpread', () => {
  it('grows with repo count but stays capped', () => {
    const small = openClusterSpread(1, 1)
    const large = openClusterSpread(1000, 1)
    expect(large).toBeGreaterThan(small)
  })

  it('scales linearly with the spread factor', () => {
    expect(openClusterSpread(10, 2)).toBeCloseTo(
      openClusterSpread(10, 1) * 2,
      5,
    )
  })
})
