import { describe, expect, it } from 'bun:test'
import * as THREE from 'three'
import { createCameraTransition } from './createCameraTransition'
import type { OrbitControls } from './types'

const makeControls = (): OrbitControls =>
  ({
    target: new THREE.Vector3(),
    update: () => {},
  }) as unknown as OrbitControls

describe('createCameraTransition', () => {
  it('starts inactive', () => {
    expect(createCameraTransition().active).toBe(false)
  })

  it('becomes active after start() and inactive again once tick() completes it', () => {
    const transition = createCameraTransition()
    const controls = makeControls()
    const camera = new THREE.PerspectiveCamera()
    const view = {
      position: new THREE.Vector3(5, 0, 0),
      target: new THREE.Vector3(),
    }

    transition.start(controls, camera, view, { now: 0, durationMs: 100 })
    expect(transition.active).toBe(true)

    const stillGoing = transition.tick(50, controls, camera)
    expect(stillGoing).toBe(true)
    expect(transition.active).toBe(true)

    const finished = transition.tick(200, controls, camera)
    expect(finished).toBe(false)
    expect(transition.active).toBe(false)
    expect(camera.position.equals(view.position)).toBe(true)
  })

  it('cancel() deactivates an in-flight transition', () => {
    const transition = createCameraTransition()
    const controls = makeControls()
    const camera = new THREE.PerspectiveCamera()
    transition.start(controls, camera, {
      position: new THREE.Vector3(),
      target: new THREE.Vector3(),
    })
    transition.cancel()
    expect(transition.active).toBe(false)
  })

  it('keeps independent state across separate factory instances', () => {
    const a = createCameraTransition()
    const b = createCameraTransition()
    const controls = makeControls()
    const camera = new THREE.PerspectiveCamera()
    a.start(controls, camera, {
      position: new THREE.Vector3(),
      target: new THREE.Vector3(),
    })
    expect(a.active).toBe(true)
    expect(b.active).toBe(false)
  })
})
