import { describe, expect, it } from 'bun:test'
import { radialFromRepoStars } from './radialFromRepoStars'

describe('radialFromRepoStars', () => {
  it('places a more popular repo at a larger radius', () => {
    const popular = radialFromRepoStars(100, 100)
    const quiet = radialFromRepoStars(1, 100)
    expect(popular).toBeGreaterThan(quiet)
  })
})
