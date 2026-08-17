import { describe, expect, it } from 'bun:test'
import { pickGasClump } from './pickGasClump'
import type { GasClumpField } from './types'

const makeClump = (weight: number) => ({
  cx: 0,
  cy: 0,
  cz: 0,
  rx: 1,
  ry: 1,
  rz: 1,
  tiltX: 0,
  tiltY: 0,
  tiltZ: 0,
  weight,
  filDx: 1,
  filDy: 0,
  filDz: 0,
  pillar: false,
})

describe('pickGasClump', () => {
  it('picks a clump proportional to hashed weight', () => {
    const field: GasClumpField = {
      clumps: [makeClump(1), makeClump(1)],
      weightSum: 2,
      morphology: 2,
    }
    const picked = pickGasClump(1, field)
    expect(field.clumps).toContain(picked)
  })

  it('falls back to the last clump when weights are exhausted', () => {
    const field: GasClumpField = {
      clumps: [makeClump(0.0001)],
      weightSum: 0.0001,
      morphology: 2,
    }
    const picked = pickGasClump(1, field)
    expect(picked).toBe(field.clumps[0] as (typeof field.clumps)[number])
  })
})
