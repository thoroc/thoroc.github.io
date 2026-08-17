import { describe, expect, it } from 'bun:test'
import * as THREE from 'three'
import { fitCameraInsideObserver } from './fitCameraInsideObserver'
import type { OrbitControls } from './types'

const makeControls = (): OrbitControls =>
  ({
    target: new THREE.Vector3(),
    minDistance: 1,
    maxDistance: 100,
    update: () => {},
  }) as unknown as OrbitControls

describe('fitCameraInsideObserver', () => {
  it('centers target on the point cloud centroid', () => {
    const controls = makeControls()
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000)
    const positions = new Float32Array([
      -100, 0, 0, 100, 0, 0, 0, 100, 0, 0, -100, 0,
    ])
    fitCameraInsideObserver(controls, camera, positions, 4)
    expect(controls.target.x).toBeCloseTo(0)
    expect(controls.target.y).toBeCloseTo(0)
  })

  it('uses the default 52-unit minimum radius when count is 0', () => {
    const controls = makeControls()
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000)
    fitCameraInsideObserver(controls, camera, new Float32Array(), 0)
    expect(controls.target.equals(new THREE.Vector3(0, 0, 0))).toBe(true)
    expect(controls.maxDistance).toBeGreaterThan(0)
  })

  it('respects a custom defaultDistanceMult option', () => {
    const controlsA = makeControls()
    const controlsB = makeControls()
    const cameraA = new THREE.PerspectiveCamera(60, 1, 0.1, 1000)
    const cameraB = new THREE.PerspectiveCamera(60, 1, 0.1, 1000)
    const positions = new Float32Array([-200, 0, 0, 200, 0, 0])
    fitCameraInsideObserver(controlsA, cameraA, positions, 2, {
      defaultDistanceMult: 0.1,
    })
    fitCameraInsideObserver(controlsB, cameraB, positions, 2, {
      defaultDistanceMult: 0.5,
    })
    expect(controlsA.target.distanceTo(cameraA.position)).not.toBeCloseTo(
      controlsB.target.distanceTo(cameraB.position),
    )
  })

  it('accepts a Vector3 viewDir override', () => {
    const controls = makeControls()
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000)
    const positions = new Float32Array([-100, 0, 0, 100, 0, 0])
    fitCameraInsideObserver(controls, camera, positions, 2, {
      viewDir: new THREE.Vector3(1, 0, 0),
    })
    expect(camera.position.x).not.toBeCloseTo(controls.target.x)
  })
})
