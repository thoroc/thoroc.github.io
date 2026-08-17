import { afterEach, describe, expect, it } from 'bun:test'
import { hasUiLocaleQuery } from './hasUiLocaleQuery'

describe('hasUiLocaleQuery', () => {
  afterEach(() => {
    window.history.replaceState({}, '', '/')
  })

  it('returns false without a lang query param', () => {
    expect(hasUiLocaleQuery()).toBe(false)
  })

  it('returns true with a lang query param', () => {
    window.history.replaceState({}, '', '/?lang=en')
    expect(hasUiLocaleQuery()).toBe(true)
  })
})
