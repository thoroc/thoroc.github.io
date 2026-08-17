import { PARTICLE_SIZE_WEIGHTS } from '../constants'
import { normLogCount } from '../repo-position'
import type { MaxCtx, RepoLike } from './types'

/** 星点尺寸分数：stars + watchers + forks，不含 pushedAt */
export const repoSizeScore = (item: RepoLike, ctx: MaxCtx): number => {
  const stars = normLogCount(item.stars, ctx.maxStars)
  const watchers = normLogCount(item.watchersCount, ctx.maxWatchers)
  const forks = normLogCount(item.forksCount, ctx.maxForks)
  const { STARS, WATCHERS, FORKS } = PARTICLE_SIZE_WEIGHTS
  return stars * STARS + watchers * WATCHERS + forks * FORKS
}
