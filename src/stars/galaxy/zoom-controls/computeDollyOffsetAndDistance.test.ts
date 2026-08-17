import { describe, expect, it } from 'bun:test'
import * as THREE from 'three'
import { computeDollyOffsetAndDistance } from './computeDollyOffsetAndDistance'
import type { OrbitControls } from './types'

const makeControls = (): OrbitControls =>
  ({
    target: new THREE.Vector3(0, 0, 0),
    minDistance: 1,
    maxDistance: 100,
    update: () => {},
  }) as unknown as OrbitControls

const makeCamera = (distance = 10) => {
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000)
  camera.position.set(0, 0, distance)
  return camera
}

describe('computeDollyOffsetAndDistance', () => {
  it('computes a smaller distance when zooming in (negative notches)', () => {
    const controls = makeControls()
    const camera = makeCamera(10)
    const result = computeDollyOffsetAndDistance(controls, camera, -1)
    expect(result.distance).toBeCloseTo(10)
    expect(result.newDistance).toBeLessThan(result.distance)
  })

  it('computes a larger distance when zooming out (positive notches)', () => {
    const controls = makeControls()
    const camera = makeCamera(10)
    const result = computeDollyOffsetAndDistance(controls, camera, 1)
    expect(result.newDistance).toBeGreaterThan(result.distance)
  })

  it('clamps newDistance within [minDistance, maxDistance]', () => {
    const controls = makeControls()
    const camera = makeCamera(10)
    const result = computeDollyOffsetAndDistance(controls, camera, 1000)
    expect(result.newDistance).toBeCloseTo(controls.maxDistance, 6)
  })
})
