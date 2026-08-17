import { describe, expect, it } from 'bun:test'
import * as THREE from 'three'
import { nudgeOrbitCamera } from './nudgeOrbitCamera'
import type { TrackballControls } from './types'

const makeControls = (): TrackballControls & { updated: boolean } => {
  const obj = {
    target: new THREE.Vector3(0, 0, 0),
    updated: false,
    update() {
      this.updated = true
    },
  }
  return obj
}

const makeCamera = () => {
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000)
  camera.position.set(0, 0, 10)
  return camera
}

describe('nudgeOrbitCamera', () => {
  it('does nothing when both deltas are 0', () => {
    const controls = makeControls()
    const camera = makeCamera()
    nudgeOrbitCamera(controls, camera)
    expect(controls.updated).toBe(false)
  })

  it('rotates the camera when dAzimuth is provided', () => {
    const controls = makeControls()
    const camera = makeCamera()
    nudgeOrbitCamera(controls, camera, 0.1, 0)
    expect(controls.updated).toBe(true)
  })

  it('rotates the camera when dPolar is provided', () => {
    const controls = makeControls()
    const camera = makeCamera()
    nudgeOrbitCamera(controls, camera, 0, 0.1)
    expect(controls.updated).toBe(true)
  })
})
