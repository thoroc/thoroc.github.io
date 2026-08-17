import { afterEach, describe, expect, it } from 'bun:test'
import { GALAXY } from '../constants'
import { buildTopicRingKeySet } from './buildTopicRingKeySet'
import type { LayoutLike, VirtualStar } from './types'

const makeLayout = (langs: string[]): LayoutLike =>
  ({ langKeys: new Set(langs) }) as unknown as LayoutLike

const makeStar = (language: string, topic: string | null): VirtualStar => ({
  repoId: `${language}-${topic ?? 'none'}`,
  item: {},
  language,
  topic,
  virtualKey: `${language}\0${topic ?? ''}`,
})

describe('buildTopicRingKeySet', () => {
  const originalEnabled = GALAXY.TOPIC_RINGS_ENABLED
  const originalMinCount = GALAXY.TOPIC_RING_MIN_COUNT
  const originalMaxCount = GALAXY.TOPIC_RING_MAX_COUNT
  const originalMaxPercent = GALAXY.TOPIC_RING_MAX_PERCENT

  afterEach(() => {
    GALAXY.TOPIC_RINGS_ENABLED = originalEnabled
    GALAXY.TOPIC_RING_MIN_COUNT = originalMinCount
    GALAXY.TOPIC_RING_MAX_COUNT = originalMaxCount
    GALAXY.TOPIC_RING_MAX_PERCENT = originalMaxPercent
  })

  it('returns an empty set when topic rings are disabled', () => {
    GALAXY.TOPIC_RINGS_ENABLED = false
    const stars = [makeStar('Rust', 'cli')]
    expect(buildTopicRingKeySet(stars, makeLayout(['Rust'])).size).toBe(0)
  })

  it('includes topics meeting the minimum count when enabled', () => {
    GALAXY.TOPIC_RINGS_ENABLED = true
    GALAXY.TOPIC_RING_MIN_COUNT = 2
    const stars = [
      makeStar('Rust', 'cli'),
      makeStar('Rust', 'cli'),
      makeStar('Rust', 'async'),
    ]
    const keys = buildTopicRingKeySet(stars, makeLayout(['Rust']))
    expect(keys.has('Rust\0cli')).toBe(true)
    expect(keys.has('Rust\0async')).toBe(false)
  })

  it('ignores virtual stars without a topic', () => {
    GALAXY.TOPIC_RINGS_ENABLED = true
    GALAXY.TOPIC_RING_MIN_COUNT = 1
    const stars = [makeStar('Rust', null)]
    expect(buildTopicRingKeySet(stars, makeLayout(['Rust'])).size).toBe(0)
  })

  it('buckets unknown languages under 其他', () => {
    GALAXY.TOPIC_RINGS_ENABLED = true
    GALAXY.TOPIC_RING_MIN_COUNT = 1
    const stars = [makeStar('COBOL', 'legacy')]
    const keys = buildTopicRingKeySet(stars, makeLayout(['Rust']))
    expect(keys.has('其他\0legacy')).toBe(true)
  })

  it('sorts multiple qualifying topics by count, then alphabetically', () => {
    GALAXY.TOPIC_RINGS_ENABLED = true
    GALAXY.TOPIC_RING_MIN_COUNT = 1
    GALAXY.TOPIC_RING_MAX_COUNT = 10
    GALAXY.TOPIC_RING_MAX_PERCENT = 1
    const stars = [
      makeStar('Rust', 'cli'),
      makeStar('Rust', 'cli'),
      makeStar('Rust', 'async'),
      makeStar('Rust', 'web'),
      makeStar('Rust', 'web'),
    ]
    const keys = buildTopicRingKeySet(stars, makeLayout(['Rust']))
    expect(keys.has('Rust\0cli')).toBe(true)
    expect(keys.has('Rust\0web')).toBe(true)
    expect(keys.has('Rust\0async')).toBe(true)
  })
})
