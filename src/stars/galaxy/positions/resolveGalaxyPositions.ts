import { findAnchorRepoId } from '../force-similarity'
import {
  extractVirtualLayoutPositions,
  hasValidGalaxyLayout,
} from '../layout-payload'
import { buildStructuredVirtualPositions } from './buildStructuredVirtualPositions'
import type {
  GalaxyCtx,
  GalaxyGasBuffersResult,
  GalaxyGasDustBuffersResult,
  GalaxyPositionsResolution,
  LayoutLike,
  RepoLike,
  VirtualStar,
} from './types'

/** 优先复用预计算布局；否则跑结构化摆位并定位锚点仓库 */
export const resolveGalaxyPositions = (
  repos: RepoLike[],
  virtualStars: VirtualStar[],
  layout: LayoutLike,
  ringKeys: Set<string>,
  gasBuffers: GalaxyGasBuffersResult | null | undefined,
  ringStarFlags: Float32Array,
  gasDustBuffers: GalaxyGasDustBuffersResult | null | undefined,
  galaxyCtx: GalaxyCtx | null | undefined,
): GalaxyPositionsResolution => {
  const precomputed =
    galaxyCtx?.layout &&
    hasValidGalaxyLayout(galaxyCtx.layout) &&
    galaxyCtx.virtualIndexMap?.size
      ? extractVirtualLayoutPositions(
          virtualStars,
          galaxyCtx.layout,
          galaxyCtx.virtualIndexMap,
        )
      : null

  if (precomputed) {
    return {
      positions: precomputed.positions,
      anchorIndex: precomputed.anchorIndex,
      harmonizeMeta: null,
    }
  }

  const structured = buildStructuredVirtualPositions(
    repos,
    virtualStars,
    layout,
    ringKeys,
    gasBuffers,
    ringStarFlags,
    gasDustBuffers,
  )
  let anchorIndex = -1
  const anchorRepoId = findAnchorRepoId(repos)
  if (anchorRepoId) {
    for (let i = 0; i < virtualStars.length; i += 1) {
      if ((virtualStars[i] as VirtualStar).repoId === anchorRepoId) {
        anchorIndex = i
        break
      }
    }
  }
  return {
    positions: structured.positions,
    anchorIndex,
    harmonizeMeta: structured.harmonizeMeta,
  }
}
