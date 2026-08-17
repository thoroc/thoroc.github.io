import { describe, expect, it } from 'bun:test'
import * as THREE from 'three'
import { focusDistanceForStar } from './focusDistanceForStar'
import { resolveFocusCameraView } from './resolveFocusCameraView'
import type { OrbitControls } from './types'

const makeControls = (targetPos = new THREE.Vector3()): OrbitControls =>
  ({
    target: targetPos,
    update: () => {},
  }) as unknown as OrbitControls

const makeCamera = (pos: THREE.Vector3) => {
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000)
  camera.position.copy(pos)
  return camera
}

describe('resolveFocusCameraView', () => {
  it('uses aSize-based distance when aSize is provided', () => {
    const controls = makeControls()
    const camera = makeCamera(new THREE.Vector3(0, 0, 10))
    const worldPoint = new THREE.Vector3(5, 0, 0)
    const view = resolveFocusCameraView(controls, camera, worldPoint, {
      aSize: 1,
    })
    expect(view.target.equals(worldPoint)).toBe(true)
    expect(view.position.distanceTo(worldPoint)).toBeCloseTo(
      focusDistanceForStar(1),
      5,
    )
  })

  it('uses box-based distance when aSize is absent', () => {
    const controls = makeControls()
    const camera = makeCamera(new THREE.Vector3(0, 0, 10))
    const worldPoint = new THREE.Vector3(0, 0, 0)
    const view = resolveFocusCameraView(controls, camera, worldPoint, {
      span: 2,
      padding: 1.2,
      maxDistance: 5,
    })
    expect(view.position.distanceTo(worldPoint)).toBeLessThanOrEqual(5)
  })

  it('falls back to +z view direction when camera sits at target', () => {
    const controls = makeControls()
    const worldPoint = new THREE.Vector3(1, 1, 1)
    const camera = makeCamera(controls.target.clone())
    const view = resolveFocusCameraView(controls, camera, worldPoint, {
      aSize: 1,
    })
    expect(view.position.z).toBeGreaterThan(worldPoint.z)
  })
})
