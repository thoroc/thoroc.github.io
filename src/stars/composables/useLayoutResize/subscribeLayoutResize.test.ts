import { describe, expect, it } from 'bun:test'
import { subscribeLayoutResize } from './subscribeLayoutResize'

const waitFrame = () => new Promise((resolve) => requestAnimationFrame(resolve))

describe('subscribeLayoutResize', () => {
  it('invokes the subscriber on a window resize event', async () => {
    let calls = 0
    const unsubscribe = subscribeLayoutResize(() => {
      calls += 1
    })
    window.dispatchEvent(new Event('resize'))
    await waitFrame()
    expect(calls).toBe(1)
    unsubscribe()
  })

  it('notifies multiple subscribers from a single resize event', async () => {
    let a = 0
    let b = 0
    const unsubA = subscribeLayoutResize(() => {
      a += 1
    })
    const unsubB = subscribeLayoutResize(() => {
      b += 1
    })
    window.dispatchEvent(new Event('resize'))
    await waitFrame()
    expect(a).toBe(1)
    expect(b).toBe(1)
    unsubA()
    unsubB()
  })

  it('coalesces rapid resize events into a single flush via rAF', async () => {
    let calls = 0
    const unsubscribe = subscribeLayoutResize(() => {
      calls += 1
    })
    window.dispatchEvent(new Event('resize'))
    window.dispatchEvent(new Event('resize'))
    window.dispatchEvent(new Event('resize'))
    await waitFrame()
    expect(calls).toBe(1)
    unsubscribe()
  })

  it('stops notifying after unsubscribe', async () => {
    let calls = 0
    const unsubscribe = subscribeLayoutResize(() => {
      calls += 1
    })
    unsubscribe()
    window.dispatchEvent(new Event('resize'))
    await waitFrame()
    expect(calls).toBe(0)
  })

  it('cancels a pending rAF flush when the last subscriber unsubscribes', async () => {
    let calls = 0
    const unsubscribe = subscribeLayoutResize(() => {
      calls += 1
    })
    window.dispatchEvent(new Event('resize'))
    unsubscribe()
    await waitFrame()
    expect(calls).toBe(0)
  })

  it('does not let one subscriber error stop the others', async () => {
    let calls = 0
    const unsubA = subscribeLayoutResize(() => {
      throw new Error('boom')
    })
    const unsubB = subscribeLayoutResize(() => {
      calls += 1
    })
    window.dispatchEvent(new Event('resize'))
    await waitFrame()
    expect(calls).toBe(1)
    unsubA()
    unsubB()
  })
})
