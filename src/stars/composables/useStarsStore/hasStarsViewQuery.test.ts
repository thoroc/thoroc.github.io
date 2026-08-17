import { afterEach, describe, expect, it } from 'bun:test'
import { hasStarsViewQuery } from './hasStarsViewQuery'

describe('hasStarsViewQuery', () => {
  afterEach(() => {
    window.history.replaceState({}, '', '/')
  })

  it('returns false without a stars-view query param', () => {
    expect(hasStarsViewQuery()).toBe(false)
  })

  it('returns true with a stars-view query param', () => {
    window.history.replaceState({}, '', '/?stars-view=list')
    expect(hasStarsViewQuery()).toBe(true)
  })
})
