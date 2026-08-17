import { MORPHOLOGY_LAYOUT } from '../constants'
import { hashStr, hashUnit } from '../hash'
import { applyMultiTopicSibling } from './applyMultiTopicSibling'
import { buildCosmicRepoAnchors } from './buildCosmicRepoAnchors'
import { buildTopicClusterCenters } from './buildTopicClusterCenters'
import { openClusterSpread } from './openClusterSpread'
import { placeDustStar } from './placeDustStar'
import { placeOpenClusterStar } from './placeOpenClusterStar'
import { placeRepoStar } from './placeRepoStar'
import { topicClusterKey } from './topicClusterKey'
import type { PlacementLayout, RepoLike, Vec3, VirtualStarLike } from './types'

/** 宇宙布局：多星系 + 开放星团 + 场星 */
export const buildMorphologicalVirtualPositions = (
  repos: RepoLike[],
  virtualStars: VirtualStarLike[] | null | undefined,
  layout: PlacementLayout,
  _ringKeys?: Set<string>,
): Float32Array => {
  const n = virtualStars?.length ?? 0
  const positions = new Float32Array(n * 3)
  if (!n) return positions
  const stars = virtualStars as VirtualStarLike[]

  const repoPosById = buildCosmicRepoAnchors(repos, layout)
  const clusterCenters = buildTopicClusterCenters(stars, repoPosById, layout)

  const repoTopicCounts = new Map<string, number>()
  for (const v of stars) {
    if (!v.topic) continue
    repoTopicCounts.set(v.repoId, (repoTopicCounts.get(v.repoId) || 0) + 1)
  }

  const { DUST_RATIO } = MORPHOLOGY_LAYOUT
  const sf = layout.spreadFactor ?? 1
  const repoTopicSlot = new Map<string, number>()

  for (let i = 0; i < n; i += 1) {
    const v = stars[i] as VirtualStarLike
    const repoAnchor = repoPosById.get(v.repoId) ?? ([0, 0, 0] as Vec3)
    const h = hashStr(v.virtualKey)
    const clusterKey = topicClusterKey(v, layout)
    const cluster = clusterKey ? clusterCenters.get(clusterKey) : null

    if (hashUnit(h, 20) < DUST_RATIO) {
      placeDustStar(
        repoAnchor,
        openClusterSpread(cluster?.[3] ?? 1, sf),
        positions,
        i,
        h,
      )
    } else if (cluster && v.topic) {
      placeOpenClusterStar(v, repoAnchor, cluster, cluster[3], positions, i, sf)
    } else {
      placeRepoStar(repoAnchor, positions, i, h, sf)
    }

    const topicCount = repoTopicCounts.get(v.repoId) || 1
    if (topicCount > 1 && v.topic) {
      const slot = repoTopicSlot.get(v.repoId) ?? 0
      repoTopicSlot.set(v.repoId, slot + 1)
      applyMultiTopicSibling(v, repoAnchor, slot, topicCount, positions, i, sf)
    }
  }

  return positions
}
