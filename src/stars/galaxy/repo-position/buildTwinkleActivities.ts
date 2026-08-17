import { TWINKLE_RANK_GAMMA } from '../constants'
import { rawTwinkleScore } from './rawTwinkleScore'
import type { MaxCtx, RepoLike } from './types'

/** 按综合分数分位映射闪烁活跃度，拉开「常亮 / 微闪 / 强闪」层次 */
export const buildTwinkleActivities = (
  list: RepoLike[],
  ctx: MaxCtx,
): Float32Array => {
  const n = list.length
  const activities = new Float32Array(n)
  if (n === 0) return activities
  if (n === 1) {
    activities[0] = 1
    return activities
  }

  const ranked = list.map((item, index) => ({
    index,
    score: rawTwinkleScore(item, ctx),
  }))
  ranked.sort((a, b) => a.score - b.score || a.index - b.index)

  const inv = 1 / (n - 1)
  for (let rank = 0; rank < n; rank += 1) {
    const percentile = rank * inv
    const entry = ranked[rank] as { index: number; score: number }
    activities[entry.index] = percentile ** TWINKLE_RANK_GAMMA
  }
  return activities
}
