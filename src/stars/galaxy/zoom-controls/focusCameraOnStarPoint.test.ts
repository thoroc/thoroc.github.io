import { describe, expect, it } from 'bun:test'
import * as THREE from 'three'
import { focusCameraOnStarPoint } from './focusCameraOnStarPoint'
import type { OrbitControls } from './types'

describe('focusCameraOnStarPoint', () => {
  it('moves target and camera to focus on the given world point', () => {
    let updated = false
    const controls = {
      target: new THREE.Vector3(),
      update: () => {
        updated = true
      },
    } as unknown as OrbitControls
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000)
    camera.position.set(0, 0, 10)
    const worldPoint = new THREE.Vector3(2, 0, 0)
    focusCameraOnStarPoint(controls, camera, worldPoint, { aSize: 1 })
    expect(controls.target.equals(worldPoint)).toBe(true)
    expect(updated).toBe(true)
  })
})
