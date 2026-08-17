import { rawTwinkleScore } from './rawTwinkleScore'
import type { MaxCtx, RepoLike } from './types'

/** 综合闪烁强度（单星，保留供测试/图例），返回 0~1 */
export const repoTwinkle = (item: RepoLike, ctx: MaxCtx): number =>
  Math.max(0, Math.min(1, rawTwinkleScore(item, ctx)))
