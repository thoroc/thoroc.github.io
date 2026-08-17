import { findAnchorRepoId } from '../../src/stars/galaxy/force-similarity'
import { buildGalaxyGasBuffers } from '../../src/stars/galaxy/gas-buffers'
import {
  isSerializableGalaxyLayout,
  serializeVirtualGalaxyLayout,
} from '../../src/stars/galaxy/layout-payload'
import { buildStructuredVirtualPositions } from '../../src/stars/galaxy/positions'
import { buildLanguageLayout } from '../../src/stars/galaxy/repo-position'
import {
  buildTopicRingKeySet,
  expandReposToVirtualStars,
} from '../../src/stars/galaxy/virtual-stars'

export function computeGalaxyLayout(items) {
  const list = items || []
  if (!list.length) {
    return serializeVirtualGalaxyLayout(list, [], new Float32Array(0), -1)
  }

  const anchorRepoId = findAnchorRepoId(list)
  const virtualStars = expandReposToVirtualStars(list)
  const langLayout = buildLanguageLayout(list)
  const ringKeys = buildTopicRingKeySet(virtualStars, langLayout)

  const gasBuffers = buildGalaxyGasBuffers(langLayout, list)

  const { positions: virtualPositions } = buildStructuredVirtualPositions(
    list,
    virtualStars,
    langLayout,
    ringKeys,
    gasBuffers,
  )

  let anchorRepoIndex = -1
  if (anchorRepoId) {
    for (let i = 0; i < list.length; i += 1) {
      if (list[i]?.id === anchorRepoId) {
        anchorRepoIndex = i
        break
      }
    }
  }

  const layout = serializeVirtualGalaxyLayout(
    list,
    virtualStars,
    virtualPositions,
    anchorRepoIndex,
  )

  if (!isSerializableGalaxyLayout(layout)) {
    throw new Error(
      'Virtual star layout is invalid (contains NaN) — check the placement parameters',
    )
  }

  return layout
}
