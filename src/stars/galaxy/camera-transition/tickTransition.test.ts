import { describe, expect, it } from 'bun:test'
import * as THREE from 'three'
import { createTransitionState } from './createTransitionState'
import { tickTransition } from './tickTransition'
import type { OrbitControls } from './types'

const makeControls = (): OrbitControls & { updated: number } => {
  const obj = {
    target: new THREE.Vector3(),
    updated: 0,
    update() {
      this.updated += 1
    },
  }
  return obj as unknown as OrbitControls & { updated: number }
}

describe('tickTransition', () => {
  it('returns false immediately when inactive', () => {
    const state = createTransitionState()
    const controls = makeControls()
    const camera = new THREE.PerspectiveCamera()
    expect(tickTransition(state, 0, controls, camera)).toBe(false)
  })

  it('samples mid-transition and returns true while in progress', () => {
    const state = createTransitionState()
    state.active = true
    state.startMs = 0
    state.durationMs = 100
    state.toPos.set(10, 0, 0)
    const controls = makeControls()
    const camera = new THREE.PerspectiveCamera()

    const result = tickTransition(state, 50, controls, camera)

    expect(result).toBe(true)
    expect(camera.position.x).toBeGreaterThan(0)
    expect(camera.position.x).toBeLessThan(10)
    expect(controls.updated).toBe(1)
  })

  it('snaps to the final pose, fires onComplete, and returns false at t>=1', () => {
    const state = createTransitionState()
    state.active = true
    state.startMs = 0
    state.durationMs = 100
    state.toPos.set(10, 0, 0)
    state.toTarget.set(1, 1, 1)
    let completed = false
    state.onComplete = () => {
      completed = true
    }
    const controls = makeControls()
    const camera = new THREE.PerspectiveCamera()

    const result = tickTransition(state, 200, controls, camera)

    expect(result).toBe(false)
    expect(camera.position.equals(state.toPos)).toBe(true)
    expect(controls.target.equals(state.toTarget)).toBe(true)
    expect(state.active).toBe(false)
    expect(completed).toBe(true)
    expect(state.onComplete).toBeNull()
    expect(controls.updated).toBe(2)
  })

  it('does not throw when onComplete is not set', () => {
    const state = createTransitionState()
    state.active = true
    state.startMs = 0
    state.durationMs = 100
    const controls = makeControls()
    const camera = new THREE.PerspectiveCamera()
    expect(() => tickTransition(state, 500, controls, camera)).not.toThrow()
  })
})
