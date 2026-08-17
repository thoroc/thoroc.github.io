import { describe, expect, it } from 'bun:test'
import * as THREE from 'three'
import { createTransitionState } from './createTransitionState'
import { startTransition } from './startTransition'
import type { OrbitControls } from './types'

const makeControls = (target = new THREE.Vector3()): OrbitControls =>
  ({ target, update: () => {} }) as unknown as OrbitControls

describe('startTransition', () => {
  it('captures the camera/controls current pose as the from-state when inactive', () => {
    const state = createTransitionState()
    const controls = makeControls(new THREE.Vector3(1, 2, 3))
    const camera = new THREE.PerspectiveCamera()
    camera.position.set(4, 5, 6)
    const view = {
      position: new THREE.Vector3(10, 10, 10),
      target: new THREE.Vector3(0, 0, 0),
    }

    startTransition(state, controls, camera, view, { now: 1000 })

    expect(state.fromPos.equals(camera.position)).toBe(true)
    expect(state.fromTarget.equals(controls.target)).toBe(true)
    expect(state.toPos.equals(view.position)).toBe(true)
    expect(state.active).toBe(true)
    expect(state.startMs).toBe(1000)
  })

  it('re-bases the from-state from the in-flight sample when already active', () => {
    const state = createTransitionState()
    state.active = true
    state.startMs = 0
    state.durationMs = 100
    state.fromPos.set(0, 0, 0)
    state.toPos.set(10, 0, 0)
    const controls = makeControls()
    const camera = new THREE.PerspectiveCamera()
    const view = {
      position: new THREE.Vector3(20, 0, 0),
      target: new THREE.Vector3(),
    }

    startTransition(state, controls, camera, view, { now: 50 })

    expect(state.fromPos.x).toBeGreaterThan(0)
    expect(state.fromPos.x).toBeLessThan(10)
  })

  it('clamps durationMs to a minimum of 80ms', () => {
    const state = createTransitionState()
    const controls = makeControls()
    const camera = new THREE.PerspectiveCamera()
    const view = { position: new THREE.Vector3(), target: new THREE.Vector3() }
    startTransition(state, controls, camera, view, { durationMs: 10 })
    expect(state.durationMs).toBe(80)
  })
})
