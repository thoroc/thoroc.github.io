import { describe, expect, it } from 'bun:test'
import * as THREE from 'three'
import { projectStarScreenDistSq } from './projectStarScreenDistSq'
import type { PickContext } from './types'

const makeCamera = () => {
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000)
  camera.position.set(0, 0, 20)
  camera.lookAt(0, 0, 0)
  camera.updateMatrixWorld(true)
  return camera
}

const baseCtx = (overrides: Partial<PickContext> = {}): PickContext => ({
  camera: makeCamera(),
  matrix: new THREE.Matrix4(),
  restPositions: new Float32Array([0, 0, 0]),
  motionFields: null,
  motionTimeSec: 0,
  w: 800,
  h: 600,
  clickX: 400,
  clickY: 300,
  sizes: null,
  brights: null,
  pixelRatio: 1,
  ...overrides,
})

describe('projectStarScreenDistSq', () => {
  it('returns a finite distance for a star near the click point', () => {
    const distSq = projectStarScreenDistSq(0, baseCtx())
    expect(distSq).not.toBeNull()
    expect(Number.isFinite(distSq)).toBe(true)
  })

  it('returns null for a star behind the camera', () => {
    const ctx = baseCtx({ restPositions: new Float32Array([0, 0, 30]) })
    expect(projectStarScreenDistSq(0, ctx)).toBeNull()
  })

  it('returns null for a star far outside the pick radius', () => {
    const ctx = baseCtx({ restPositions: new Float32Array([50, 50, 0]) })
    expect(projectStarScreenDistSq(0, ctx)).toBeNull()
  })

  it('applies motion fields when provided', () => {
    const motionFields = {
      galaxyHubs: new Float32Array([0, 0, 0]),
      nebulaCenters: new Float32Array([0, 0, 0]),
      motionOmega: new Float32Array([0, 0, 0, 0]),
      motionOmega2: new Float32Array([0, 0, 0, 0]),
      yBobAmp: new Float32Array([0]),
      yBobPhase: new Float32Array([0]),
    }
    const ctx = baseCtx({ motionFields })
    const distSq = projectStarScreenDistSq(0, ctx)
    expect(distSq).not.toBeNull()
  })

  it('reads size and brightness arrays when provided', () => {
    const ctx = baseCtx({
      sizes: new Float32Array([2]),
      brights: new Float32Array([0.8]),
    })
    const distSq = projectStarScreenDistSq(0, ctx)
    expect(distSq).not.toBeNull()
  })
})
