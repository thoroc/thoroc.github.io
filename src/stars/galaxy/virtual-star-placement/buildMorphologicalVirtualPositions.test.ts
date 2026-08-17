import { describe, expect, it } from 'bun:test'
import { buildMorphologicalVirtualPositions } from './buildMorphologicalVirtualPositions'

const layout = {
  languages: ['TypeScript', 'Rust'],
  langKeys: new Set(['TypeScript', 'Rust']),
  langCounts: new Map([
    ['TypeScript', 40],
    ['Rust', 20],
  ]),
  spreadFactor: 1,
}

describe('buildMorphologicalVirtualPositions', () => {
  it('returns an empty buffer for no virtual stars', () => {
    expect(buildMorphologicalVirtualPositions([], [], layout)).toEqual(
      new Float32Array(0),
    )
  })

  it('places every virtual star at a finite position', () => {
    const repos = [
      { id: 'a', language: 'TypeScript' },
      { id: 'b', language: 'Rust' },
    ]
    const virtualStars = [
      {
        virtualKey: 'a:cli:1',
        repoId: 'a',
        topic: 'cli',
        language: 'TypeScript',
      },
      {
        virtualKey: 'a:cli:2',
        repoId: 'a',
        topic: 'cli',
        language: 'TypeScript',
      },
      { virtualKey: 'b', repoId: 'b', language: 'Rust' },
    ]
    const positions = buildMorphologicalVirtualPositions(
      repos,
      virtualStars,
      layout,
    )
    expect(positions.length).toBe(9)
    for (let i = 0; i < positions.length; i += 1) {
      expect(Number.isFinite(positions[i])).toBe(true)
    }
  })
})
