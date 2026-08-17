import { afterEach, describe, expect, it } from 'bun:test'
import { resetStateForTests } from './resetStateForTests'
import { rowRemeasureController, scrollController } from './state'

describe('state', () => {
  afterEach(resetStateForTests)

  it('scrollController defaults to a safe no-op', () => {
    expect(() => scrollController.fn()).not.toThrow()
  })

  it('rowRemeasureController defaults to a safe no-op', () => {
    expect(() => rowRemeasureController.fn()).not.toThrow()
  })
})
