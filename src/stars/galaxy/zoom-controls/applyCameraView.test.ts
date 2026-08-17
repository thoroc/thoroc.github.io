import { describe, expect, it } from 'bun:test'
import * as THREE from 'three'
import { applyCameraView } from './applyCameraView'
import type { OrbitControls } from './types'

describe('applyCameraView', () => {
  it('copies view position/target onto camera/controls and calls update', () => {
    let updated = false
    const controls = {
      target: new THREE.Vector3(),
      update: () => {
        updated = true
      },
    } as unknown as OrbitControls
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000)
    const view = {
      position: new THREE.Vector3(1, 2, 3),
      target: new THREE.Vector3(4, 5, 6),
    }
    applyCameraView(controls, camera, view)
    expect(camera.position.equals(view.position)).toBe(true)
    expect(controls.target.equals(view.target)).toBe(true)
    expect(updated).toBe(true)
  })
})
