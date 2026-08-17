import { describe, expect, it } from 'bun:test'
import * as THREE from 'three'
import { createTransitionState } from './createTransitionState'
import { sample } from './sample'

describe('sample', () => {
  it('eases position/target from -> to at the given t', () => {
    const state = createTransitionState()
    state.fromPos.set(0, 0, 0)
    state.toPos.set(10, 0, 0)
    state.fromTarget.set(0, 0, 0)
    state.toTarget.set(0, 10, 0)

    const outPos = new THREE.Vector3()
    const outTarget = new THREE.Vector3()
    sample(state, 0.5, outPos, outTarget)

    expect(outPos.x).toBeCloseTo(5)
    expect(outTarget.y).toBeCloseTo(5)
  })

  it('reaches the exact from/to values at the endpoints', () => {
    const state = createTransitionState()
    state.fromPos.set(1, 2, 3)
    state.toPos.set(4, 5, 6)

    const outPos = new THREE.Vector3()
    const outTarget = new THREE.Vector3()
    sample(state, 0, outPos, outTarget)
    expect(outPos.equals(state.fromPos)).toBe(true)

    sample(state, 1, outPos, outTarget)
    expect(outPos.equals(state.toPos)).toBe(true)
  })
})
