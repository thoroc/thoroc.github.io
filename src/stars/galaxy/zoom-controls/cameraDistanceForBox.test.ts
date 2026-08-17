import { describe, expect, it } from 'bun:test'
import * as THREE from 'three'
import { cameraDistanceForBox } from './cameraDistanceForBox'

describe('cameraDistanceForBox', () => {
  it('returns a larger distance for a larger box', () => {
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000)
    const small = new THREE.Box3(
      new THREE.Vector3(-1, -1, -1),
      new THREE.Vector3(1, 1, 1),
    )
    const large = new THREE.Box3(
      new THREE.Vector3(-10, -10, -10),
      new THREE.Vector3(10, 10, 10),
    )
    expect(cameraDistanceForBox(camera, large)).toBeGreaterThan(
      cameraDistanceForBox(camera, small),
    )
  })

  it('applies the padding multiplier', () => {
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000)
    const box = new THREE.Box3(
      new THREE.Vector3(-1, -1, -1),
      new THREE.Vector3(1, 1, 1),
    )
    const base = cameraDistanceForBox(camera, box, 1)
    const padded = cameraDistanceForBox(camera, box, 2)
    expect(padded).toBeCloseTo(base * 2)
  })
})
