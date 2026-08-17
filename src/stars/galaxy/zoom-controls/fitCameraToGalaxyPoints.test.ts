import { describe, expect, it } from 'bun:test'
import * as THREE from 'three'
import { fitCameraToGalaxyPoints } from './fitCameraToGalaxyPoints'
import type { OrbitControls } from './types'

const makeControls = (): OrbitControls =>
  ({
    target: new THREE.Vector3(),
    minDistance: 1,
    maxDistance: 100,
    update: () => {},
  }) as unknown as OrbitControls

const makeCamera = () => new THREE.PerspectiveCamera(60, 1, 0.1, 1000)

describe('fitCameraToGalaxyPoints', () => {
  it('centers the target on the point cloud centroid', () => {
    const controls = makeControls()
    const camera = makeCamera()
    const positions = new Float32Array([
      -10, 0, 0, 10, 0, 0, 0, 10, 0, 0, -10, 0,
    ])
    fitCameraToGalaxyPoints(controls, camera, positions, 4)
    expect(controls.target.x).toBeCloseTo(0)
    expect(controls.target.y).toBeCloseTo(0)
  })

  it('falls back to a default box when count is 0', () => {
    const controls = makeControls()
    const camera = makeCamera()
    fitCameraToGalaxyPoints(controls, camera, new Float32Array(), 0)
    expect(controls.target.equals(new THREE.Vector3(0, 0, 0))).toBe(true)
    expect(camera.position.length()).toBeGreaterThan(0)
  })

  it('widens minDistance/maxDistance based on point spread', () => {
    const controls = makeControls()
    const camera = makeCamera()
    const positions = new Float32Array([-500, 0, 0, 500, 0, 0])
    fitCameraToGalaxyPoints(controls, camera, positions, 2)
    expect(controls.maxDistance).toBeGreaterThan(100)
  })
})
