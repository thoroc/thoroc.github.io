import { PARTICLE_SIZE_RANGE } from '../constants'
import { mapInfluenceToRange } from '../repo-position'
import { repoSizeScore } from './repoSizeScore'
import type { MaxCtx, RepoLike } from './types'

/** 单仓估算（非分位；批量构建请用 buildStarSizes） */
export const repoParticleSize = (item: RepoLike, ctx: MaxCtx): number =>
  mapInfluenceToRange(repoSizeScore(item, ctx), PARTICLE_SIZE_RANGE)
