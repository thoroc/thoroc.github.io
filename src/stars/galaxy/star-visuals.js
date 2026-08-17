import {
  PARTICLE_BRIGHT_RANGE,
  PARTICLE_SIZE_RANGE,
  PARTICLE_SIZE_WEIGHTS,
} from './constants'
import {
  mapInfluenceToRange,
  normLogCount,
  repoVisualInfluence,
} from './repo-position'

/** 星点尺寸分数：stars + watchers + forks，不含 pushedAt */
function repoSizeScore(item, ctx) {
  const stars = normLogCount(item.stars, ctx.maxStars)
  const watchers = normLogCount(item.watchersCount, ctx.maxWatchers)
  const forks = normLogCount(item.forksCount, ctx.maxForks)
  const { STARS, WATCHERS, FORKS } = PARTICLE_SIZE_WEIGHTS
  return stars * STARS + watchers * WATCHERS + forks * FORKS
}

/**
 * 按尺寸分数分位映射 aSize，拉开 star 数层次（与闪烁分位同理）
 * @param {Array<object>} list
 * @param {{ maxStars: number, maxForks: number, maxWatchers: number }} ctx
 */
export function buildStarSizes(list, ctx) {
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
    sizes[ranked[rank].index] = MIN + t * (MAX - MIN)
  }
  return sizes
}

/** 单仓估算（非分位；批量构建请用 buildStarSizes） */
export function repoParticleSize(item, ctx) {
  return mapInfluenceToRange(repoSizeScore(item, ctx), PARTICLE_SIZE_RANGE)
}

export function repoBrightness(item, ctx) {
  return mapInfluenceToRange(
    repoVisualInfluence(item, ctx),
    PARTICLE_BRIGHT_RANGE,
  )
}

export function buildLanguageLegend(items, topN = 10) {
  const counts = new Map()
  for (const item of items || []) {
    const key = item.language || '其他'
    counts.set(key, (counts.get(key) || 0) + 1)
  }
  return [...counts.entries()]
    .sort(
      (a, b) =>
        b[1] - a[1] || String(a[0]).localeCompare(String(b[0]), 'zh-CN'),
    )
    .slice(0, topN)
    .map(([name, count]) => ({ name, count }))
}

export function buildStarTierLegend(items) {
  const tiers = [
    { key: '50k+', min: 50000, count: 0 },
    { key: '10k+', min: 10000, count: 0 },
    { key: '1k+', min: 1000, count: 0 },
    { key: '<1k', min: 0, count: 0 },
  ]
  for (const item of items || []) {
    const s = Number(item.stars) || 0
    if (s >= 50000) tiers[0].count += 1
    else if (s >= 10000) tiers[1].count += 1
    else if (s >= 1000) tiers[2].count += 1
    else tiers[3].count += 1
  }
  return tiers.filter((tier) => tier.count > 0)
}

/** @param {number | string | null | undefined} stars */
export function repoStarTierKey(stars) {
  const s = Number(stars) || 0
  if (s >= 50000) return '50k+'
  if (s >= 10000) return '10k+'
  if (s >= 1000) return '1k+'
  return '<1k'
}

/**
 * 与图例语言桶一致的分组 key
 * @param {{ language?: string | null }} item
 * @param {Set<string> | string[]} legendLangs
 */
export function repoLegendLanguageKey(item, legendLangs) {
  const topSet = legendLangs instanceof Set ? legendLangs : new Set(legendLangs)
  const lang = item.language || '其他'
  return topSet.has(lang) ? lang : '其他'
}

/** @param {string} owner @param {string} [repoName] */
export function ownerSelfRepoId(owner, repoName) {
  const name = String(owner || '')
    .trim()
    .toLowerCase()
  if (!name) return ''
  const repo = String(repoName || name)
    .trim()
    .toLowerCase()
  if (repo !== name) return ''
  return `${name}-${name}`
}
