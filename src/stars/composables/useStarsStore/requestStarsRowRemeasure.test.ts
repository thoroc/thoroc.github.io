import { afterEach, describe, expect, it } from 'bun:test'
import { nextTick } from 'vue'
import { requestStarsRowRemeasure } from './requestStarsRowRemeasure'
import { resetStateForTests } from './resetStateForTests'
import { rowRemeasureController } from './state'

describe('requestStarsRowRemeasure', () => {
  afterEach(resetStateForTests)

  it('invokes the registered row-remeasure controller on next tick', async () => {
    let receivedIndex: number | null | undefined
    rowRemeasureController.fn = (index) => {
      receivedIndex = index
    }
    requestStarsRowRemeasure(2)
    await nextTick()
    expect(receivedIndex).toBe(2)
  })
})
