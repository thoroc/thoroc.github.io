import { afterEach, describe, expect, it } from 'bun:test'
import { resetStateForTests } from './resetStateForTests'
import { scrollListToTop } from './scrollListToTop'
import { scrollController, viewMode } from './state'

describe('scrollListToTop', () => {
  afterEach(resetStateForTests)

  it('invokes the scroll controller while in list view', () => {
    let called = false
    scrollController.fn = () => {
      called = true
    }
    viewMode.value = 'list'
    scrollListToTop()
    expect(called).toBe(true)
  })

  it('does nothing while in galaxy view', () => {
    let called = false
    scrollController.fn = () => {
      called = true
    }
    viewMode.value = 'galaxy'
    scrollListToTop()
    expect(called).toBe(false)
  })
})
