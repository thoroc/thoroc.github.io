import {
  buildGalaxyGasBuffers,
  buildGalaxyGasDustBuffers,
} from '../gas-buffers'
import { buildLanguageLayout } from '../repo-position'
import {
  buildLanguageLegend,
  buildStarSizes,
  buildStarTierLegend,
} from '../star-visuals'
import {
  buildRepoIdToVirtualIndices,
  buildTopicRingKeySet,
  expandReposToVirtualStars,
} from '../virtual-stars'
import { buildRepoActivityById } from './buildRepoActivityById'
import { buildStarVisualBuffers } from './buildStarVisualBuffers'
import { finalizeGalaxyMotion } from './finalizeGalaxyMotion'
import { resolveGalaxyPositions } from './resolveGalaxyPositions'
import { scanRepoMaxima } from './scanRepoMaxima'
import type { GalaxyBuffers, GalaxyCtx, RepoLike } from './types'

export const buildGalaxyBuffers = (
  items: RepoLike[] | null | undefined,
  galaxyCtx: GalaxyCtx | null = null,
): GalaxyBuffers => {
  const repos = items || []
  const virtualStars = expandReposToVirtualStars(repos)
  const count = virtualStars.length

  const { maxStars, maxForks, maxWatchers } = scanRepoMaxima(repos)
  const twinkleCtx = { maxStars, maxForks, maxWatchers }
  const sizeCtx = { maxStars, maxForks, maxWatchers }
  const repoActivityById = buildRepoActivityById(repos, twinkleCtx)

  const layout = buildLanguageLayout(repos)
  const ringKeys = buildTopicRingKeySet(virtualStars, layout)

  const gasBuffers = buildGalaxyGasBuffers(layout, repos)
  const gasDustBuffers = buildGalaxyGasDustBuffers(layout, repos)
  const ringStarFlags = new Float32Array(count)

  const { positions, anchorIndex, harmonizeMeta } = resolveGalaxyPositions(
    repos,
    virtualStars,
    layout,
    ringKeys,
    gasBuffers,
    ringStarFlags,
    gasDustBuffers,
    galaxyCtx,
  )

  const sizes = buildStarSizes(
    virtualStars.map((v) => v.item),
    sizeCtx,
  )
  const { colors, brights, activities, seeds, idToIndex } =
    buildStarVisualBuffers(
      virtualStars,
      sizeCtx,
      sizes,
      anchorIndex,
      repoActivityById,
    )
  const repoIdToIndices = buildRepoIdToVirtualIndices(virtualStars)

  const motion = finalizeGalaxyMotion(
    virtualStars,
    layout,
    ringKeys,
    sizes,
    brights,
    count,
    ringStarFlags,
    positions,
    harmonizeMeta,
    gasBuffers,
    gasDustBuffers,
  )

  return {
    count,
    maxStars,
    positions,
    colors,
    sizes,
    brights,
    activities,
    seeds,
    idToIndex,
    repoIdToIndices,
    items: virtualStars.map((v) => v.item),
    virtualStars,
    ringKeys,
    legend: buildLanguageLegend(repos),
    starTiers: buildStarTierLegend(repos),
    motion,
    anchorIndex,
    gas: gasBuffers,
    gasDust: gasDustBuffers,
    ringStarFlags,
  }
}
