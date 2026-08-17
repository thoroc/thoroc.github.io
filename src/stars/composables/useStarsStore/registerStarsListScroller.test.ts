import { afterEach, describe, expect, it } from 'bun:test'
import { registerStarsListScroller } from './registerStarsListScroller'
import { resetStateForTests } from './resetStateForTests'
import { scrollController } from './state'

describe('registerStarsListScroller', () => {
  afterEach(resetStateForTests)

  it('installs the given function as the scroll controller', () => {
    let called = false
    registerStarsListScroller(() => {
      called = true
    })
    scrollController.fn()
    expect(called).toBe(true)
  })

  it('falls back to a no-op for a non-function argument', () => {
    registerStarsListScroller('not a function')
    expect(() => scrollController.fn()).not.toThrow()
  })
})
