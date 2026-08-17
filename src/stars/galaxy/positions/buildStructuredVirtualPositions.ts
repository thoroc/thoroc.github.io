import { buildLanguageGalaxyHubs } from '../galaxy-field'
import { buildHarmonizedRawLanguageHubs } from '../motion-hubs'
import {
  buildMorphologicalVirtualPositions,
  harmonizeCosmicSpan,
} from '../virtual-star-placement'
import { applyTopicRingRefinement } from '../virtual-stars'
import type {
  GalaxyGasBuffersResult,
  GalaxyGasDustBuffersResult,
  HarmonizeMeta,
  LayoutLike,
  RepoLike,
  VirtualStar,
} from './types'

/** 分层摆位：语言星系 → 开放星团（topic）→ 单星（仓） */
export const buildStructuredVirtualPositions = (
  repos: RepoLike[],
  virtualStars: VirtualStar[],
  layout: LayoutLike,
  ringKeys: Set<string>,
  gasBuffers?: GalaxyGasBuffersResult | null,
  ringStarFlags: Float32Array | null = null,
  gasDustBuffers: GalaxyGasDustBuffersResult | null = null,
): { positions: Float32Array; harmonizeMeta: HarmonizeMeta | null } => {
  const positions = buildMorphologicalVirtualPositions(
    repos,
    virtualStars,
    layout,
    ringKeys,
  )
  const aux: Array<{ buf: Float32Array; n: number }> = []
  if (gasBuffers && gasBuffers.count > 0) {
    aux.push({ buf: gasBuffers.positions, n: gasBuffers.count })
  }
  if (gasDustBuffers && gasDustBuffers.count > 0) {
    aux.push({ buf: gasDustBuffers.positions, n: gasDustBuffers.count })
  }
  const harmonizeMeta = harmonizeCosmicSpan(positions, virtualStars.length, aux)
  const hubs =
    buildHarmonizedRawLanguageHubs(layout, harmonizeMeta) ??
    buildLanguageGalaxyHubs(layout)
  applyTopicRingRefinement(virtualStars, positions, layout, ringKeys, {
    totalRepos: repos?.length ?? 0,
    hubs,
    ringStarFlags,
  })
  return { positions, harmonizeMeta }
}
