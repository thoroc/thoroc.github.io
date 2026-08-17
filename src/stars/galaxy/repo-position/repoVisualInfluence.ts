import { PARTICLE_VISUAL_WEIGHTS } from '../constants'
import { normLogCount } from './normLogCount'
import { pushRecencyScore } from './pushRecencyScore'
import type { MaxCtx, RepoLike } from './types'

/** 综合视觉影响力：推送时效 + star + watch + fork */
export const repoVisualInfluence = (item: RepoLike, ctx: MaxCtx): number => {
  const push = pushRecencyScore(item.pushedAt)
  const stars = normLogCount(item.stars, ctx.maxStars)
  const watchers = normLogCount(item.watchersCount, ctx.maxWatchers)
  const forks = normLogCount(item.forksCount, ctx.maxForks)
  const { PUSH, STARS, WATCHERS, FORKS } = PARTICLE_VISUAL_WEIGHTS
  return push * PUSH + stars * STARS + watchers * WATCHERS + forks * FORKS
}
