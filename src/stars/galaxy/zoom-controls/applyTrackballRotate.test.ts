import { describe, expect, it } from 'bun:test'
import * as THREE from 'three'
import { applyTrackballRotate } from './applyTrackballRotate'
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
  camera.up.set(0, 1, 0)
  return camera
}

describe('applyTrackballRotate', () => {
  it('does nothing when movement is negligible', () => {
    const controls = makeControls()
    const camera = makeCamera()
    applyTrackballRotate(controls, camera, 0, 0, 600)
    expect(camera.position.z).toBe(10)
    expect(controls.updated).toBe(false)
  })

  it('rotates the camera around the target and calls update', () => {
    const controls = makeControls()
    const camera = makeCamera()
    applyTrackballRotate(controls, camera, 40, 0, 600)
    expect(controls.updated).toBe(true)
    expect(camera.position.distanceTo(controls.target)).toBeCloseTo(10, 1)
    expect(camera.position.x).not.toBeCloseTo(0)
  })

  it('is a no-op when the rotation axis is degenerate', () => {
    const controls = makeControls()
    const camera = makeCamera()
    camera.position.set(0, 10, 0)
    applyTrackballRotate(controls, camera, 0, 5, 600)
    expect(controls.updated).toBe(false)
  })
})
