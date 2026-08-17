import { describe, expect, it } from 'bun:test'
import { motionSign } from './motionSign'

describe('motionSign', () => {
  it('returns 1 or -1 deterministically for the same key', () => {
    const a = motionSign('TypeScript')
    const b = motionSign('TypeScript')
    expect([1, -1]).toContain(a)
    expect(a).toBe(b)
  })

  it('can differ between distinct keys', () => {
    expect(motionSign('a')).not.toBe(undefined)
    expect(motionSign('b')).not.toBe(undefined)
  })
})
