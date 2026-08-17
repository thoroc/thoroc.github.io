import { describe, expect, it } from 'bun:test'
import * as THREE from 'three'
import { resolveDollyCameraView } from './resolveDollyCameraView'
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

describe('resolveDollyCameraView', () => {
  it('returns null when signedNotches is 0', () => {
    expect(resolveDollyCameraView(makeControls(), makeCamera(), 0)).toBeNull()
  })

  it('returns a view with the target preserved and position offset', () => {
    const controls = makeControls()
    const camera = makeCamera(10)
    const view = resolveDollyCameraView(controls, camera, -1)
    expect(view).not.toBeNull()
    expect(view?.target.equals(controls.target)).toBe(true)
    expect(view?.position.distanceTo(controls.target)).toBeLessThan(10)
  })
})
