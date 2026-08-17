import { describe, expect, it } from 'bun:test'
import { galaxyFrameAngles } from './galaxyFrameAngles'
import { sampleLanguageKernel } from './sampleLanguageKernel'

describe('sampleLanguageKernel', () => {
  it('samples a finite world-space position around the kernel center', () => {
    const kernel = {
      cx: 1,
      cy: 2,
      cz: 3,
      sigma: 5,
      frame: galaxyFrameAngles('TypeScript'),
      lang: 'TypeScript',
    }
    const [x, y, z] = sampleLanguageKernel(1, kernel)
    expect(Number.isFinite(x)).toBe(true)
    expect(Number.isFinite(y)).toBe(true)
    expect(Number.isFinite(z)).toBe(true)
  })
})
