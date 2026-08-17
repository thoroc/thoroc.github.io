import { describe, expect, it } from 'bun:test'
import * as THREE from 'three'
import { fitCameraToBox } from './fitCameraToBox'
import type { OrbitControls } from './types'

const makeControls = (): OrbitControls =>
  ({
    target: new THREE.Vector3(),
    minDistance: 1,
    maxDistance: 100,
    update: () => {},
  }) as unknown as OrbitControls

describe('fitCameraToBox', () => {
  it('centers target on box center and offsets camera along viewDir', () => {
    const controls = makeControls()
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000)
    const box = new THREE.Box3(
      new THREE.Vector3(-2, -2, -2),
      new THREE.Vector3(2, 2, 2),
    )
    fitCameraToBox(controls, camera, box)
    expect(controls.target.equals(new THREE.Vector3(0, 0, 0))).toBe(true)
    expect(camera.position.length()).toBeGreaterThan(0)
  })
})
