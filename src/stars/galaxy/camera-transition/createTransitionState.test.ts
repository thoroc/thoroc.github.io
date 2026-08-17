import { describe, expect, it } from 'bun:test'
import { createTransitionState } from './createTransitionState'

describe('createTransitionState', () => {
  it('returns an inactive state with zeroed vectors and a 400ms default duration', () => {
    const state = createTransitionState()
    expect(state.active).toBe(false)
    expect(state.durationMs).toBe(400)
    expect(state.onComplete).toBeNull()
    expect(state.fromPos.length()).toBe(0)
    expect(state.toTarget.length()).toBe(0)
  })

  it('returns a fresh, independent state object on each call', () => {
    const a = createTransitionState()
    const b = createTransitionState()
    a.active = true
    expect(b.active).toBe(false)
    expect(a.fromPos).not.toBe(b.fromPos)
  })
})
