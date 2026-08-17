import { describe, expect, it } from 'bun:test'
import { buildLanguageLayout } from '../repo-position'
import { buildMotionFields } from './buildMotionFields'

describe('buildMotionFields', () => {
  it('does not throw, and returns finite per-star motion fields', () => {
    const layout = buildLanguageLayout([
      { language: 'TypeScript' },
      { language: 'Rust' },
    ])
    const list = [
      {
        virtualKey: 'a',
        repoId: 'repo-a',
        item: {},
        language: 'TypeScript',
        topic: 'cli',
      },
      {
        virtualKey: 'b',
        repoId: 'repo-b',
        item: {},
        language: 'Rust',
        topic: null,
      },
    ]
    const positions = new Float32Array([1, 2, 3, 4, 5, 6])

    expect(() => buildMotionFields(list, positions, 2, layout)).not.toThrow()

    const fields = buildMotionFields(list, positions, 2, layout)
    expect(fields.galaxyHubs.length).toBe(6)
    expect(fields.motionOmega.length).toBe(8)
    expect(fields.motionOmega2.length).toBe(8)
    expect(fields.yBobAmp.length).toBe(2)
    expect(fields.yBobPhase.length).toBe(2)
    for (const buf of [
      fields.galaxyHubs,
      fields.nebulaCenters,
      fields.motionOmega,
      fields.motionOmega2,
      fields.yBobAmp,
      fields.yBobPhase,
    ]) {
      for (let i = 0; i < buf.length; i += 1) {
        expect(Number.isFinite(buf[i])).toBe(true)
      }
    }
  })

  it('uses the topic-cluster nebula center once topic count reaches the threshold', () => {
    const layout = buildLanguageLayout([{ language: 'TypeScript' }])
    const list = Array.from({ length: 6 }, (_, i) => ({
      virtualKey: `v${i}`,
      repoId: `repo-${i}`,
      item: {},
      language: 'TypeScript',
      topic: 'cli',
    }))
    const positions = new Float32Array(18).map((_, i) => i)
    const fields = buildMotionFields(list, positions, 6, layout)
    for (let i = 0; i < fields.nebulaCenters.length; i += 1) {
      expect(Number.isFinite(fields.nebulaCenters[i])).toBe(true)
    }
  })

  it('respects langHubOverrides when provided', () => {
    const layout = buildLanguageLayout([{ language: 'TypeScript' }])
    const list = [
      {
        virtualKey: 'a',
        repoId: 'repo-a',
        item: {},
        language: 'TypeScript',
        topic: null,
      },
    ]
    const positions = new Float32Array([1, 2, 3])
    const overrides = new Map<string, [number, number, number]>([
      ['TypeScript', [10, 20, 30]],
    ])
    const fields = buildMotionFields(
      list,
      positions,
      1,
      layout,
      new Set(),
      overrides,
    )
    expect(Number.isFinite(fields.galaxyHubs[0])).toBe(true)
  })
})
