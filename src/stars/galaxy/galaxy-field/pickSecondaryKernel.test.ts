import { describe, expect, it } from 'bun:test'
import { galaxyFrameAngles } from './galaxyFrameAngles'
import { pickSecondaryKernel } from './pickSecondaryKernel'

const makeKernel = (lang: string) => ({
  cx: 0,
  cy: 0,
  cz: 0,
  sigma: 1,
  frame: galaxyFrameAngles(lang),
  lang,
})

describe('pickSecondaryKernel', () => {
  it('returns null when fewer than 2 kernels exist', () => {
    const kernels = new Map([['TypeScript', makeKernel('TypeScript')]])
    expect(pickSecondaryKernel(1, 'TypeScript', kernels)).toBeNull()
  })

  it('returns a different language kernel when at least 2 exist', () => {
    const kernels = new Map([
      ['TypeScript', makeKernel('TypeScript')],
      ['Rust', makeKernel('Rust')],
    ])
    const picked = pickSecondaryKernel(1, 'TypeScript', kernels)
    expect(picked).not.toBeNull()
    expect(picked?.lang).not.toBe('TypeScript')
  })
})
