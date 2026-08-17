import { describe, expect, it } from 'bun:test'
import * as THREE from 'three'
import { createTransitionState } from './createTransitionState'
import { currentSample } from './currentSample'

describe('currentSample', () => {
  it('returns false and leaves outputs untouched when inactive', () => {
    const state = createTransitionState()
    const outPos = new THREE.Vector3(1, 1, 1)
    const outTarget = new THREE.Vector3()
    const result = currentSample(state, 100, outPos, outTarget)
    expect(result).toBe(false)
    expect(outPos.x).toBe(1)
  })

  it('returns true and samples the transition when active', () => {
    const state = createTransitionState()
    state.active = true
    state.startMs = 0
    state.durationMs = 100
    state.toPos.set(10, 0, 0)

    const outPos = new THREE.Vector3()
    const outTarget = new THREE.Vector3()
    const result = currentSample(state, 50, outPos, outTarget)
    expect(result).toBe(true)
    expect(outPos.x).toBeGreaterThan(0)
    expect(outPos.x).toBeLessThan(10)
  })
})
