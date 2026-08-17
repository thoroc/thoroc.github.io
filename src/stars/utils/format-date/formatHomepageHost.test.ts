import { describe, expect, it } from 'bun:test'
import { formatHomepageHost } from './formatHomepageHost'

describe('formatHomepageHost', () => {
  it('returns an empty string for a falsy url', () => {
    expect(formatHomepageHost(null)).toBe('')
    expect(formatHomepageHost(undefined)).toBe('')
    expect(formatHomepageHost('')).toBe('')
  })

  it('strips the protocol and a leading www. from a full URL', () => {
    expect(formatHomepageHost('https://www.example.com/path')).toBe(
      'example.com',
    )
  })

  it('prepends https:// to a bare hostname before parsing', () => {
    expect(formatHomepageHost('example.com')).toBe('example.com')
  })

  it('falls back to a truncated string when the URL cannot be parsed', () => {
    const longInvalid = `not a url ${'x'.repeat(60)}`
    const result = formatHomepageHost(longInvalid)
    expect(result.endsWith('…')).toBe(true)
    expect(result.length).toBe(46)
  })

  it('returns the original string unmodified when short and unparseable', () => {
    expect(formatHomepageHost('not a url')).toBe('not a url')
  })
})
