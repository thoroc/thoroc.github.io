import { describe, expect, it } from 'bun:test'
import { galaxyFrameAngles } from './galaxyFrameAngles'

describe('galaxyFrameAngles', () => {
  it('returns deterministic tilt angles for a language', () => {
    const a = galaxyFrameAngles('TypeScript')
    const b = galaxyFrameAngles('TypeScript')
    expect(a).toEqual(b)
    expect(Number.isFinite(a.tiltX)).toBe(true)
    expect(Number.isFinite(a.tiltY)).toBe(true)
    expect(Number.isFinite(a.tiltZ)).toBe(true)
  })
})
