import { PARTICLE_BRIGHT_RANGE } from '../constants'
import { mapInfluenceToRange, repoVisualInfluence } from '../repo-position'
import type { MaxCtx } from './types'

export const repoBrightness = (
  item: Parameters<typeof repoVisualInfluence>[0],
  ctx: MaxCtx,
): number =>
  mapInfluenceToRange(repoVisualInfluence(item, ctx), PARTICLE_BRIGHT_RANGE)
