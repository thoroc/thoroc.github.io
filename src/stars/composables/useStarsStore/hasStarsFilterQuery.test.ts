import { afterEach, describe, expect, it } from 'bun:test'
import { hasStarsFilterQuery } from './hasStarsFilterQuery'

describe('hasStarsFilterQuery', () => {
  afterEach(() => {
    window.history.replaceState({}, '', '/')
  })

  it('returns false with no filter query params', () => {
    expect(hasStarsFilterQuery()).toBe(false)
  })

  it('returns true when any tracked filter query param is present', () => {
    for (const key of [
      'stars-q',
      'stars-lang',
      'stars-license',
      'stars-year',
      'stars-type',
      'stars-sort',
    ]) {
      window.history.replaceState({}, '', `/?${key}=x`)
      expect(hasStarsFilterQuery()).toBe(true)
    }
    window.history.replaceState({}, '', '/')
  })
})
