import { describe, expect, it } from 'bun:test'
import { isMobileViewport } from './isMobileViewport'

describe('isMobileViewport', () => {
  it('returns a boolean reflecting the current MOBILE_MEDIA match', () => {
    expect(typeof isMobileViewport()).toBe('boolean')
  })
})
