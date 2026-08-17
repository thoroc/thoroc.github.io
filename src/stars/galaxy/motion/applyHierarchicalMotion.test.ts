import { describe, expect, it } from 'bun:test'
import { applyHierarchicalMotion } from './applyHierarchicalMotion'
import type { MotionFields } from './types'

const fields: MotionFields = {
  galaxyHubs: new Float32Array([1, 2, 3]),
  nebulaCenters: new Float32Array([0.5, 0.5, 0.5]),
  motionOmega: new Float32Array([0.1, 0.2, 0.3, 0]),
  motionOmega2: new Float32Array([0.05, 0.02, 0, 0.4]),
  yBobAmp: new Float32Array([0.1]),
  yBobPhase: new Float32Array([0.2]),
}

describe('applyHierarchicalMotion', () => {
  it('returns a finite world-space position', () => {
    const [x, y, z] = applyHierarchicalMotion(1, 0, 0, fields, 0, 1)
    expect(Number.isFinite(x)).toBe(true)
    expect(Number.isFinite(y)).toBe(true)
    expect(Number.isFinite(z)).toBe(true)
  })

  it('skips the cluster-relative branch when spin and orbit are both 0', () => {
    const noCluster: MotionFields = {
      ...fields,
      motionOmega: new Float32Array([0.1, 0.2, 0, 0]),
      motionOmega2: new Float32Array([0.05, 0, 0, 0.4]),
    }
    const [x, y, z] = applyHierarchicalMotion(1, 0, 0, noCluster, 0, 1)
    expect(Number.isFinite(x)).toBe(true)
    expect(Number.isFinite(y)).toBe(true)
    expect(Number.isFinite(z)).toBe(true)
  })

  it('returns the same point at time 0', () => {
    const zeroFields: MotionFields = {
      galaxyHubs: new Float32Array([0, 0, 0]),
      nebulaCenters: new Float32Array([0, 0, 0]),
      motionOmega: new Float32Array([0, 0, 0, 0]),
      motionOmega2: new Float32Array([0, 0, 0, 0]),
      yBobAmp: new Float32Array([0]),
      yBobPhase: new Float32Array([0]),
    }
    expect(applyHierarchicalMotion(5, 0, 0, zeroFields, 0, 0)).toEqual([
      5, 0, 0,
    ])
  })
})
