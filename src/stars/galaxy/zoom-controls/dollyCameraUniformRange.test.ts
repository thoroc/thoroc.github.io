import { describe, expect, it } from 'bun:test'
import * as THREE from 'three'
import { dollyCameraUniformRange } from './dollyCameraUniformRange'
import type { OrbitControls } from './types'

const makeControls = (): OrbitControls => {
  let updated = false
  return {
    target: new THREE.Vector3(0, 0, 0),
    minDistance: 1,
    maxDistance: 100,
    update: () => {
      updated = true
    },
    get updated() {
      return updated
    },
  } as unknown as OrbitControls & { updated: boolean }
}

const makeCamera = (distance = 10) => {
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000)
  camera.position.set(0, 0, distance)
  camera.updateMatrixWorld(true)
  return camera
}

describe('dollyCameraUniformRange', () => {
  it('does nothing when signedNotches is 0', () => {
    const controls = makeControls()
    const camera = makeCamera(10)
    dollyCameraUniformRange(controls, camera, 0)
    expect(camera.position.z).toBe(10)
  })

  it('moves the camera closer along target axis without cursor zoom', () => {
    const controls = makeControls()
    const camera = makeCamera(10)
    dollyCameraUniformRange(controls, camera, -1)
    expect(camera.position.distanceTo(controls.target)).toBeLessThan(10)
    expect((controls as unknown as { updated: boolean }).updated).toBe(true)
  })

  it('zooms toward the cursor when zoomToCursor and ndc are provided', () => {
    const controls = makeControls()
    const camera = makeCamera(10)
    dollyCameraUniformRange(controls, camera, -1, {
      zoomToCursor: true,
      ndc: { x: 0, y: 0 },
    })
    expect(camera.position.z).toBeLessThan(10)
  })

  it('falls back to target-based dolly when the cursor ray is degenerate', () => {
    const controls = makeControls()
    const camera = makeCamera(10)
    // Collapse projection/world matrices so unproject() maps every NDC point
    // back onto the camera position itself (lengthSq ~0), exercising the
    // defensive fallback branch that a valid frustum can never reach.
    // biome-ignore format: matrix literal is clearer unformatted
    camera.matrixWorld.set(
      0, 0, 0, camera.position.x,
      0, 0, 0, camera.position.y,
      0, 0, 0, camera.position.z,
      0, 0, 0, 1,
    )
    camera.projectionMatrixInverse.identity()

    dollyCameraUniformRange(controls, camera, 1, {
      zoomToCursor: true,
      ndc: { x: 0, y: 0 },
    })

    expect(camera.position.distanceTo(controls.target)).toBeGreaterThan(10)
    expect((controls as unknown as { updated: boolean }).updated).toBe(true)
  })
})
