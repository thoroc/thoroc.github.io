import { describe, expect, it } from 'bun:test'
import { buildCosmicRepoAnchors } from './buildCosmicRepoAnchors'

const layout = {
  languages: ['TypeScript', 'Rust'],
  langKeys: new Set(['TypeScript', 'Rust']),
  langCounts: new Map([
    ['TypeScript', 40],
    ['Rust', 20],
  ]),
  spreadFactor: 1,
}

describe('buildCosmicRepoAnchors', () => {
  it('assigns a finite anchor position to every repo with an id', () => {
    const repos = [
      { id: 'a', language: 'TypeScript' },
      { id: 'b', language: 'Rust' },
    ]
    const anchors = buildCosmicRepoAnchors(repos, layout)
    expect(anchors.size).toBe(2)
    for (const [x, y, z] of anchors.values()) {
      expect(Number.isFinite(x)).toBe(true)
      expect(Number.isFinite(y)).toBe(true)
      expect(Number.isFinite(z)).toBe(true)
    }
  })

  it('skips repos without an id', () => {
    const anchors = buildCosmicRepoAnchors([{ language: 'TypeScript' }], layout)
    expect(anchors.size).toBe(0)
  })
})
