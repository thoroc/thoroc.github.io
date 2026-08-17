import { PARTICLE_SIZE_RANGE } from '../constants'
import { repoSizeScore } from './repoSizeScore'
import type { MaxCtx, RepoLike } from './types'

/** 按尺寸分数分位映射 aSize，拉开 star 数层次（与闪烁分位同理） */
export const buildStarSizes = (list: RepoLike[], ctx: MaxCtx): Float32Array => {
  const n = list.length
  const sizes = new Float32Array(n)
  if (n === 0) return sizes
  const { MIN, MAX, RANK_GAMMA } = PARTICLE_SIZE_RANGE
  if (n === 1) {
    sizes[0] = MIN + (MAX - MIN) * 0.72
    return sizes
  }

  const ranked = list.map((item, index) => ({
    index,
    score: repoSizeScore(item, ctx),
  }))
  ranked.sort((a, b) => a.score - b.score || a.index - b.index)

  const inv = 1 / (n - 1)
  const rankGamma = RANK_GAMMA ?? 0.55
  for (let rank = 0; rank < n; rank += 1) {
    const percentile = rank * inv
    const t = percentile ** rankGamma
    const entry = ranked[rank] as { index: number; score: number }
    sizes[entry.index] = MIN + t * (MAX - MIN)
  }
  return sizes
}
