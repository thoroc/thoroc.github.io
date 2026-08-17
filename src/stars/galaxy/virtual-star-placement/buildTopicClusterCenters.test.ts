import { describe, expect, it } from 'bun:test'
import { buildTopicClusterCenters } from './buildTopicClusterCenters'

const layout = { langKeys: new Set(['TypeScript']) }

describe('buildTopicClusterCenters', () => {
  it('computes the centroid of member repo anchors', () => {
    const repoPosById = new Map([
      ['a', [0, 0, 0] as [number, number, number]],
      ['b', [2, 0, 0] as [number, number, number]],
    ])
    const virtualStars = [
      {
        virtualKey: 'a:cli',
        repoId: 'a',
        topic: 'cli',
        language: 'TypeScript',
      },
      {
        virtualKey: 'b:cli',
        repoId: 'b',
        topic: 'cli',
        language: 'TypeScript',
      },
    ]
    const centers = buildTopicClusterCenters(virtualStars, repoPosById, layout)
    const center = centers.get('TypeScript\0cli')
    expect(center).toEqual([1, 0, 0, 2])
  })

  it('ignores stars without a topic or a missing repo anchor', () => {
    const virtualStars = [
      { virtualKey: 'a', repoId: 'a' },
      { virtualKey: 'b:cli', repoId: 'missing', topic: 'cli' },
    ]
    const centers = buildTopicClusterCenters(virtualStars, new Map(), layout)
    expect(centers.size).toBe(0)
  })

  it('counts each repo once per cluster even with multiple stars', () => {
    const repoPosById = new Map([['a', [4, 0, 0] as [number, number, number]]])
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
    ]
    const centers = buildTopicClusterCenters(virtualStars, repoPosById, layout)
    expect(centers.get('TypeScript\0cli')).toEqual([4, 0, 0, 1])
  })
})
