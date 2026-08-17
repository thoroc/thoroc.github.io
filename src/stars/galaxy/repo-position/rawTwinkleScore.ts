import { TWINKLE_WEIGHTS } from '../constants'
import { normLogCount } from './normLogCount'
import { pushRecencyScore } from './pushRecencyScore'
import type { MaxCtx, RepoLike } from './types'

/** 原始闪烁分数（未做分位拉伸） */
export const rawTwinkleScore = (item: RepoLike, ctx: MaxCtx): number => {
  const push = pushRecencyScore(item.pushedAt)
  const stars = normLogCount(item.stars, ctx.maxStars)
  const watchers = normLogCount(item.watchersCount, ctx.maxWatchers)
  const forks = normLogCount(item.forksCount, ctx.maxForks)
  const { PUSH, STARS, WATCHERS, FORKS } = TWINKLE_WEIGHTS
  return push * PUSH + stars * STARS + watchers * WATCHERS + forks * FORKS
}
