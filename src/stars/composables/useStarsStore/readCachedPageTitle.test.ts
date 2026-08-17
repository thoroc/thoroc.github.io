import { afterEach, describe, expect, it } from 'bun:test'
import { readCachedPageTitle } from './readCachedPageTitle'
import { PAGE_TITLE_CACHE_KEY } from './state'

describe('readCachedPageTitle', () => {
  afterEach(() => {
    sessionStorage.removeItem(PAGE_TITLE_CACHE_KEY)
  })

  it('returns an empty string when nothing is cached', () => {
    expect(readCachedPageTitle()).toBe('')
  })

  it('returns the trimmed cached title', () => {
    sessionStorage.setItem(PAGE_TITLE_CACHE_KEY, '  My Stars  ')
    expect(readCachedPageTitle()).toBe('My Stars')
  })

  it('returns an empty string for a blank cached value', () => {
    sessionStorage.setItem(PAGE_TITLE_CACHE_KEY, '   ')
    expect(readCachedPageTitle()).toBe('')
  })

  it('returns an empty string when sessionStorage.getItem throws', () => {
    // Plain assignment (`sessionStorage.getItem = fn`) is silently a no-op
    // in this environment — sessionStorage's methods live on the prototype
    // and a direct assignment doesn't shadow them here. defineProperty does.
    const original = sessionStorage.getItem
    Object.defineProperty(sessionStorage, 'getItem', {
      value: () => {
        throw new Error('boom')
      },
      configurable: true,
    })
    expect(readCachedPageTitle()).toBe('')
    Object.defineProperty(sessionStorage, 'getItem', {
      value: original,
      configurable: true,
    })
  })
})
