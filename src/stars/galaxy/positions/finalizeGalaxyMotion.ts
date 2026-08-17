import { GALAXY } from '../constants'
import {
  buildHarmonizedLanguageHubs,
  buildHarmonizedRawLanguageHubs,
  buildMotionFields,
  fillGasMotionFields,
} from '../motion'
import { boostTopicRingStars } from './boostTopicRingStars'
import type {
  GalaxyGasBuffersResult,
  GalaxyGasDustBuffersResult,
  HarmonizeMeta,
  LayoutLike,
  MotionFields,
  VirtualStar,
} from './types'

/** 语言环加成 + 动效字段（hub 摆位、气体云运动） */
export const finalizeGalaxyMotion = (
  virtualStars: VirtualStar[],
  layout: LayoutLike,
  ringKeys: Set<string>,
  sizes: Float32Array,
  brights: Float32Array,
  count: number,
  ringStarFlags: Float32Array,
  positions: Float32Array,
  harmonizeMeta: HarmonizeMeta | null,
  gasBuffers: GalaxyGasBuffersResult | null | undefined,
  gasDustBuffers: GalaxyGasDustBuffersResult | null | undefined,
): MotionFields => {
  if (GALAXY.TOPIC_RINGS_ENABLED) {
    boostTopicRingStars(
      virtualStars,
      layout,
      ringKeys,
      sizes,
      brights,
      count,
      ringStarFlags,
    )
  }

  const langHubOverrides =
    buildHarmonizedRawLanguageHubs(layout, harmonizeMeta) ??
    buildHarmonizedLanguageHubs(layout, virtualStars, positions, count)

  const motion = buildMotionFields(
    virtualStars,
    positions,
    count,
    layout,
    ringKeys,
    langHubOverrides,
  )
  fillGasMotionFields(gasBuffers, layout, langHubOverrides)
  fillGasMotionFields(gasDustBuffers, layout, langHubOverrides)
  return motion
}
