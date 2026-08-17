import { describe, expect, it } from 'bun:test'
import * as THREE from 'three'
import { pickStarIndexScreen } from './pickStarIndexScreen'
import type { PickOptions } from './types'

const makeCamera = () => {
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000)
  camera.position.set(0, 0, 20)
  camera.lookAt(0, 0, 0)
  camera.updateMatrixWorld(true)
  return camera
}

const baseOpts = (overrides: Partial<PickOptions> = {}): PickOptions => ({
  camera: makeCamera(),
  points: new THREE.Points(),
  restPositions: new Float32Array([0, 0, 0, 100, 100, 0]),
  starCount: 2,
  clientX: 400,
  clientY: 300,
  canvasRect: { left: 0, top: 0, width: 800, height: 600 } as DOMRect,
  ...overrides,
})

describe('pickStarIndexScreen', () => {
  it('returns null when required inputs are missing', () => {
    expect(pickStarIndexScreen(baseOpts({ starCount: 0 }))).toBeNull()
    expect(
      pickStarIndexScreen(
        baseOpts({
          canvasRect: { left: 0, top: 0, width: 0, height: 0 } as DOMRect,
        }),
      ),
    ).toBeNull()
  })

  it('picks the star closest to the click point', () => {
    const idx = pickStarIndexScreen(baseOpts())
    expect(idx).toBe(0)
  })

  it('returns null when no star is within the pick radius', () => {
    const idx = pickStarIndexScreen(
      baseOpts({
        restPositions: new Float32Array([500, 500, 0]),
        starCount: 1,
      }),
    )
    expect(idx).toBeNull()
  })
})
