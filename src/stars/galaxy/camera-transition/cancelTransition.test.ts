import { describe, expect, it } from 'bun:test'
import { cancelTransition } from './cancelTransition'
import { createTransitionState } from './createTransitionState'

describe('cancelTransition', () => {
  it('deactivates the state and clears onComplete', () => {
    const state = createTransitionState()
    state.active = true
    state.onComplete = () => {}
    cancelTransition(state)
    expect(state.active).toBe(false)
    expect(state.onComplete).toBeNull()
  })
})
