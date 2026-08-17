import { afterEach, describe, expect, it } from 'bun:test'
import { registerStarsRowRemeasure } from './registerStarsRowRemeasure'
import { resetStateForTests } from './resetStateForTests'
import { rowRemeasureController } from './state'

describe('registerStarsRowRemeasure', () => {
  afterEach(resetStateForTests)

  it('installs the given function as the row-remeasure controller', () => {
    let receivedIndex: number | null | undefined
    registerStarsRowRemeasure((index?: number | null) => {
      receivedIndex = index
    })
    rowRemeasureController.fn(3)
    expect(receivedIndex).toBe(3)
  })

  it('falls back to a no-op for a non-function argument', () => {
    registerStarsRowRemeasure(null)
    expect(() => rowRemeasureController.fn()).not.toThrow()
  })
})
