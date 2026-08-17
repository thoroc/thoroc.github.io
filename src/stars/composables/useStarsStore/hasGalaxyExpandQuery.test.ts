import { afterEach, describe, expect, it } from 'bun:test'
import { hasGalaxyExpandQuery } from './hasGalaxyExpandQuery'

describe('hasGalaxyExpandQuery', () => {
  afterEach(() => {
    window.history.replaceState({}, '', '/')
  })

  it('returns false without a stars-galaxy-expand query param', () => {
    expect(hasGalaxyExpandQuery()).toBe(false)
  })

  it('returns true with a stars-galaxy-expand query param', () => {
    window.history.replaceState({}, '', '/?stars-galaxy-expand=1')
    expect(hasGalaxyExpandQuery()).toBe(true)
  })
})
