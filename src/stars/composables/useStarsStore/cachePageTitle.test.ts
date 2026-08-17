import { afterEach, describe, expect, it } from 'bun:test'
import { cachePageTitle } from './cachePageTitle'
import { PAGE_TITLE_CACHE_KEY } from './state'

describe('cachePageTitle', () => {
  afterEach(() => {
    sessionStorage.removeItem(PAGE_TITLE_CACHE_KEY)
  })

  it('stores the title for later reads', () => {
    cachePageTitle('My Stars')
    expect(sessionStorage.getItem(PAGE_TITLE_CACHE_KEY)).toBe('My Stars')
  })

  it('does nothing for an empty title', () => {
    cachePageTitle('')
    expect(sessionStorage.getItem(PAGE_TITLE_CACHE_KEY)).toBeNull()
  })

  it('does not throw when sessionStorage.setItem fails', () => {
    // Plain assignment is silently a no-op in this environment — see the
    // matching note in readCachedPageTitle.test.ts.
    const original = sessionStorage.setItem
    Object.defineProperty(sessionStorage, 'setItem', {
      value: () => {
        throw new Error('quota exceeded')
      },
      configurable: true,
    })
    expect(() => cachePageTitle('My Stars')).not.toThrow()
    Object.defineProperty(sessionStorage, 'setItem', {
      value: original,
      configurable: true,
    })
  })
})
