import { describe, expect, it } from 'bun:test'
import { applyHierarchicalMotion } from './applyHierarchicalMotion'
import { motionWorldPosition } from './motionWorldPosition'
import type { MotionFields } from './types'

const fields: MotionFields = {
  galaxyHubs: new Float32Array([1, 2, 3]),
  nebulaCenters: new Float32Array([0.5, 0.5, 0.5]),
  motionOmega: new Float32Array([0.1, 0.2, 0.3, 0]),
  motionOmega2: new Float32Array([0.05, 0.02, 0, 0.4]),
  yBobAmp: new Float32Array([0.1]),
  yBobPhase: new Float32Array([0.2]),
}

describe('motionWorldPosition', () => {
  it('delegates to applyHierarchicalMotion', () => {
    expect(motionWorldPosition(1, 0, 0, fields, 0, 1)).toEqual(
      applyHierarchicalMotion(1, 0, 0, fields, 0, 1),
    )
  })
})
