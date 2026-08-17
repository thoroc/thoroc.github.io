import { topicClusterKey } from './topicClusterKey'
import type {
  PlacementLayout,
  TopicClusterAccumulator,
  TopicClusterCenter,
  Vec3,
  VirtualStarLike,
} from './types'

/** 按语言+topic 聚合开放星团中心（团心 = 成员仓锚点质心） */
export const buildTopicClusterCenters = (
  virtualStars: VirtualStarLike[],
  repoPosById: Map<string, Vec3>,
  layout: PlacementLayout,
): Map<string, TopicClusterCenter> => {
  const acc = new Map<string, TopicClusterAccumulator>()
  const seenRepos = new Map<string, Set<string>>()

  for (const v of virtualStars) {
    if (!v.topic) continue
    const key = topicClusterKey(v, layout)
    const base = repoPosById.get(v.repoId)
    if (!base) continue
    if (!acc.has(key)) {
      acc.set(key, { sx: 0, sy: 0, sz: 0, repoN: 0 })
      seenRepos.set(key, new Set())
    }
    const repos = seenRepos.get(key) as Set<string>
    if (repos.has(v.repoId)) continue
    repos.add(v.repoId)
    const m = acc.get(key) as TopicClusterAccumulator
    m.sx += base[0]
    m.sy += base[1]
    m.sz += base[2]
    m.repoN += 1
  }

  const centers = new Map<string, TopicClusterCenter>()
  for (const [key, m] of acc) {
    if (m.repoN > 0) {
      centers.set(key, [
        m.sx / m.repoN,
        m.sy / m.repoN,
        m.sz / m.repoN,
        m.repoN,
      ])
    }
  }
  return centers
}
