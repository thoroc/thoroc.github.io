import { describe, expect, it } from 'bun:test'
import { buildGasClumpField } from './buildGasClumpField'

describe('buildGasClumpField', () => {
  it('builds a field with at least one weighted clump', () => {
    const field = buildGasClumpField('TypeScript', 100)
    expect(field.clumps.length).toBeGreaterThan(0)
    expect(field.weightSum).toBeGreaterThan(0)
    expect(field.morphology).toBe(2)
  })

  it('is deterministic for the same language and radius', () => {
    const a = buildGasClumpField('Rust', 50)
    const b = buildGasClumpField('Rust', 50)
    expect(a).toEqual(b)
  })
})
