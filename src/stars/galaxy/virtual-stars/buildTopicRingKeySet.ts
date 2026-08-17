import { GALAXY } from '../constants'
import { topicRingKey } from './topicRingKey'
import type { LayoutLike, VirtualStar } from './types'

/** 固定阈值 + 每语言 Top 环（数量上限与 10% 取 min） */
export const buildTopicRingKeySet = (
  virtualStars: VirtualStar[],
  layout: LayoutLike,
): Set<string> => {
  if (!GALAXY.TOPIC_RINGS_ENABLED) return new Set()

  const ringKeys = new Set<string>()
  const { TOPIC_RING_MIN_COUNT, TOPIC_RING_MAX_COUNT, TOPIC_RING_MAX_PERCENT } =
    GALAXY

  const langTopicCounts = new Map<string, Map<string, number>>()
  const langTopicKinds = new Map<string, Set<string>>()

  for (const v of virtualStars) {
    if (!v.topic) continue
    const lang = layout?.langKeys?.has(v.language) ? v.language : '其他'
    if (!langTopicCounts.has(lang)) {
      langTopicCounts.set(lang, new Map())
      langTopicKinds.set(lang, new Set())
    }
    const m = langTopicCounts.get(lang) as Map<string, number>
    m.set(v.topic, (m.get(v.topic) || 0) + 1)
    ;(langTopicKinds.get(lang) as Set<string>).add(v.topic)
  }

  for (const [lang, topicMap] of langTopicCounts) {
    const kindCount = langTopicKinds.get(lang)?.size ?? 0
    const cap = Math.min(
      TOPIC_RING_MAX_COUNT,
      Math.max(1, Math.ceil(kindCount * TOPIC_RING_MAX_PERCENT)),
    )
    const candidates = [...topicMap.entries()]
      .filter(([, count]) => count >= TOPIC_RING_MIN_COUNT)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'zh-CN'))
      .slice(0, cap)

    for (const [topic] of candidates) {
      ringKeys.add(topicRingKey(lang, topic))
    }
  }

  return ringKeys
}
