import { blendCosmicColor, stellarTempRgb } from './colors.js'
import {
  GALAXY,
  PARTICLE_VISUAL_WEIGHTS,
  PUSH_RECENCY_HALF_LIFE_DAYS,
  R_MAX,
  R_MIN,
  STAR_YEAR_MAX,
  STAR_YEAR_MIN,
  TWINKLE_RANK_GAMMA,
  TWINKLE_WEIGHTS,
} from './constants.js'
import { gauss3, hashSeed, hashStr, hashUnit } from './hash'

function starredYear(starredAt) {
  const y = parseInt(String(starredAt || '').slice(0, 4), 10)
  if (!Number.isFinite(y)) return STAR_YEAR_MAX
  return Math.min(STAR_YEAR_MAX, Math.max(STAR_YEAR_MIN, y))
}

export function normLogCount(value, max) {
  const v = Math.log1p(Number(value) || 0)
  const m = Math.log1p(Math.max(max, 1))
  return m > 0 ? v / m : 0
}

/** 最近推送时效分 0~1，越近越大 */
function pushRecencyScore(pushedAt) {
  const ts = Date.parse(pushedAt || '')
  if (!Number.isFinite(ts)) return 0.08
  const ageDays = (Date.now() - ts) / 86400000
  return Math.max(0.05, 1 - Math.min(1, ageDays / PUSH_RECENCY_HALF_LIFE_DAYS))
}

/**
 * 综合视觉影响力：推送时效 + star + watch + fork
 * @param {object} item
 * @param {{ maxStars: number, maxForks: number, maxWatchers: number }} ctx
 */
export function repoVisualInfluence(item, ctx) {
  const push = pushRecencyScore(item.pushedAt)
  const stars = normLogCount(item.stars, ctx.maxStars)
  const watchers = normLogCount(item.watchersCount, ctx.maxWatchers)
  const forks = normLogCount(item.forksCount, ctx.maxForks)
  const { PUSH, STARS, WATCHERS, FORKS } = PARTICLE_VISUAL_WEIGHTS
  return push * PUSH + stars * STARS + watchers * WATCHERS + forks * FORKS
}

export function virtualStarRgb(v, langRgb, influence) {
  const h = hashStr(v.virtualKey)
  const jitter = (((h >>> 8) & 0xffff) / 0xffff) * 0.18 - 0.09
  const stellar = stellarTempRgb(influence, jitter)
  const langMix = v.topic ? 0.58 : 0.68
  return blendCosmicColor(langRgb, stellar, langMix)
}

export function mapInfluenceToRange(influence, range) {
  const t = Math.max(0, Math.min(1, influence)) ** range.GAMMA
  return range.MIN + t * (range.MAX - range.MIN)
}

/**
 * 原始闪烁分数（未做分位拉伸）
 * @param {{ pushedAt?: string, stars?: number, forksCount?: number, watchersCount?: number }} item
 * @param {{ maxStars: number, maxForks: number, maxWatchers: number }} ctx
 */
function rawTwinkleScore(item, ctx) {
  const push = pushRecencyScore(item.pushedAt)
  const stars = normLogCount(item.stars, ctx.maxStars)
  const watchers = normLogCount(item.watchersCount, ctx.maxWatchers)
  const forks = normLogCount(item.forksCount, ctx.maxForks)
  const { PUSH, STARS, WATCHERS, FORKS } = TWINKLE_WEIGHTS
  return push * PUSH + stars * STARS + watchers * WATCHERS + forks * FORKS
}

/**
 * 按综合分数分位映射闪烁活跃度，拉开「常亮 / 微闪 / 强闪」层次
 * @param {Array<object>} list
 * @param {{ maxStars: number, maxForks: number, maxWatchers: number }} ctx
 */
export function buildTwinkleActivities(list, ctx) {
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
    activities[ranked[rank].index] = percentile ** TWINKLE_RANK_GAMMA
  }
  return activities
}

/**
 * 综合闪烁强度（单星，保留供测试/图例）
 * @param {{ pushedAt?: string, stars?: number, forksCount?: number, watchersCount?: number }} item
 * @param {{ maxStars: number, maxForks: number, maxWatchers: number }} ctx
 * @returns {number} 0~1
 */
export function repoTwinkle(item, ctx) {
  return Math.max(0, Math.min(1, rawTwinkleScore(item, ctx)))
}

function activityFactor(pushedAt) {
  return pushRecencyScore(pushedAt)
}

function radialFromStarYear(starredAt) {
  const year = starredYear(starredAt)
  const span = STAR_YEAR_MAX - STAR_YEAR_MIN + 1
  const norm = (year - STAR_YEAR_MIN) / span
  return R_MIN + (R_MAX - R_MIN) * (0.22 + norm * 0.48)
}

function radialFromRepoStars(stars, maxStars) {
  const norm =
    Math.log1p(Number(stars) || 0) / Math.log1p(Math.max(maxStars, 1))
  return R_MIN + (R_MAX - R_MIN) * (0.26 + norm * 0.52)
}

/** @param {{ topics?: string[] }} item */
export function primaryTopic(item) {
  const topics = Array.isArray(item?.topics) ? item.topics : []
  if (!topics.length) return ''
  return String(topics[0]).toLowerCase()
}

/**
 * 为当前可见仓库分配语言团中心（黄金角 + 按数量分角宽，避免等分扇区拉成星带）
 * @param {Array<{ language?: string | null }>} items
 */
export function buildLanguageLayout(items) {
  const list = items || []
  const counts = new Map()
  for (const item of list) {
    const key = item.language || '其他'
    counts.set(key, (counts.get(key) || 0) + 1)
  }

  const sorted = [...counts.entries()].sort(
    (a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0]), 'zh-CN'),
  )
  const topN = GALAXY.LAYOUT_LANG_TOP
  const primaryTop = sorted.slice(0, topN).map(([name]) => name)
  const topSet = new Set(primaryTop)
  const layoutLangs = [...primaryTop]
  if (!topSet.has('其他')) layoutLangs.push('其他')

  const n = Math.max(layoutLangs.length, 1)
  const total = Math.max(list.length, 1)
  const golden = Math.PI * (3 - Math.sqrt(5))
  const langAngles = new Map()
  const langWedge = new Map()
  const langRadial = new Map()
  const langCounts = new Map()
  const langKeys = new Set(layoutLangs)

  layoutLangs.forEach((name, i) => {
    let count = 0
    if (name === '其他') {
      for (const item of list) {
        const key = item.language || '其他'
        if (!topSet.has(key)) count += 1
      }
      if (topSet.has('其他')) count += counts.get('其他') || 0
    } else {
      count = counts.get(name) || 0
    }
    const share = Math.max(count, 1) / total
    const ang = i * golden * 2.4 - Math.PI / 2
    const lh = hashStr(`lang-layout:${name}`)
    const rBase = 0.04 + ((i + 0.5) / n) * 0.78
    const rJitter = hashUnit(lh, 8) * 0.2
    const rr =
      R_MIN * 0.08 +
      (R_MAX - R_MIN) *
        Math.min(0.96, rBase + rJitter + Math.sqrt(share) * 0.14)
    langAngles.set(name, ang)
    langRadial.set(name, rr)
    langCounts.set(name, count)
    langWedge.set(name, Math.PI * 2 * Math.sqrt(share) * GALAXY.LANG_WEDGE_FILL)
  })

  const spreadFactor = Math.max(1.25, (Math.max(list.length, 1) / 650) ** 0.4)

  return {
    langAngles,
    langWedge,
    langRadial,
    langCounts,
    langKeys,
    languages: layoutLangs,
    wedge: (Math.PI * 2) / n,
    spreadFactor,
  }
}

function layoutLanguageKey(item, layout) {
  const lang = item.language || '其他'
  return layout.langKeys.has(lang) ? lang : '其他'
}

/** topic 在语言扇区内的角偏移（同 topic 会靠得更近） */
function topicAngleOffset(item, layout) {
  const lang = layoutLanguageKey(item, layout)
  const topic = primaryTopic(item) || '__none__'
  const wedge =
    layout.langWedge.get(lang) ?? layout.wedge * GALAXY.LANG_WEDGE_FILL
  const h = hashStr(`${lang}\0${topic}`)
  const u = hashUnit(h, 4)
  return (u - 0.5) * wedge * 0.75
}

/** topic 在语言团内的径向微偏移 */
function topicRadialOffset(item) {
  const topic = primaryTopic(item) || '__none__'
  const h = hashStr(`r:${item.language}:${topic}:${item.id}`)
  return (
    gauss3(hashSeed(h, 'a'), hashSeed(h, 'b'), hashSeed(h, 'c')) *
    GALAXY.TOPIC_RADIAL_JITTER
  )
}

/**
 * 连续对数螺旋角 + 场星
 * @param {number} h
 * @param {number} rr
 * @param {number} a
 * @param {number} b
 * @param {number} c
 */
function spiralAngle(h, rr, a, b, c) {
  const t = (rr - R_MIN) / (R_MAX - R_MIN + 1)
  const logSpiral = Math.log1p(t * 3.5) * GALAXY.TWIST
  const phase = hashUnit(h, 6) * Math.PI * 2

  if (hashUnit(h, 18) < GALAXY.FIELD_RATIO) {
    return hashUnit(h, 10) * Math.PI * 2 + gauss3(a, b, c) * 0.18
  }

  const armWobble = Math.sin(logSpiral * 1.6 + phase * 2.1) * 0.08
  return logSpiral + phase + armWobble + gauss3(a, b, c) * GALAXY.ARM_SPREAD
}

/**
 * 盘厚 + 银心隆起 + 轻微盘面翘曲
 * @param {number} h
 * @param {{ rr: number, ang: number, t: number, ySeed: [number, number, number], starNorm: number, act: number }} p
 */
function diskHeight(h, { rr, ang, t, ySeed, starNorm, act }) {
  const [ya, yb, yc] = ySeed
  const bulge =
    Math.exp(-((rr / 20) ** 2)) * GALAXY.BULGE * (1.15 + (1 - t) * 0.45)
  const diskY = gauss3(ya, yb, yc) * GALAXY.THICKNESS * (0.35 + t * 0.95)
  const warp = Math.sin(ang * 2 + hashUnit(h, 14) * Math.PI) * t * 2.4
  const lift = starNorm * GALAXY.THICKNESS * 0.28 * (1 - act * 0.35)
  return diskY + bulge * gauss3(ya, yb, yc) * 0.62 + warp + lift
}

/**
 * 在盘坐标基础上叠加 3D 椭球散布
 * @param {number} h
 * @param {{ ySeed: [number, number, number], rSeed: [number, number, number] }} p
 */
function volumeOffset(h, { ySeed, rSeed }) {
  const [ya, yb, yc] = ySeed
  const [ra, rb, rc] = rSeed
  const vx = gauss3(hashSeed(h, 'vx1'), hashSeed(h, 'vx2'), hashSeed(h, 'vx3'))
  const vy = gauss3(ya, yb, yc)
  const vz = gauss3(ra, rb, rc)
  return [
    vx * GALAXY.VOLUME_SPREAD_XZ,
    vy * GALAXY.VOLUME_SPREAD_Y,
    vz * GALAXY.VOLUME_SPREAD_XZ,
  ]
}

/**
 * @param {object} item
 * @param {number} maxStars
 * @param {ReturnType<typeof buildLanguageLayout> | null} [layout]
 */
export function repoPosition(item, maxStars, layout = null) {
  const h = hashStr(item.id || item.fullName || '')
  const ra = hashSeed(h, 'r1')
  const rb = hashSeed(h, 'r2')
  const rc = hashSeed(h, 'r3')
  const a = hashSeed(h, 'a1')
  const b = hashSeed(h, 'a2')
  const cc = hashSeed(h, 'a3')
  const ya = hashSeed(h, 'y1')
  const yb = hashSeed(h, 'y2')
  const yc = hashSeed(h, 'y3')

  const yearR = radialFromStarYear(item.starredAt)
  const starR = radialFromRepoStars(item.stars, maxStars)
  const repoRr = yearR * 0.3 + starR * 0.7

  let rr
  let ang

  if (layout) {
    const lang = layoutLanguageKey(item, layout)
    const clusterAng =
      (layout.langAngles.get(lang) ?? 0) + topicAngleOffset(item, layout)
    const clusterRr = layout.langRadial.get(lang) ?? repoRr
    const wedge = layout.langWedge.get(lang) ?? layout.wedge
    const langN = layout.langCounts?.get(lang) ?? 1
    const langSpread = 0.95 + Math.sqrt(langN / 100) * 0.75

    const spreadAng =
      gauss3(a, b, cc) * wedge * GALAXY.LANG_CLUSTER_SPREAD_ANG * langSpread
    const spreadR =
      gauss3(ra, rb, rc) *
        (GALAXY.LANG_CLUSTER_SPREAD_R + wedge * 6) *
        langSpread +
      topicRadialOffset(item)

    ang = clusterAng + spreadAng
    rr = clusterRr + spreadR

    const spiralAng = spiralAngle(h, rr, a, b, cc)
    ang += spiralAng * 0.1
    rr = rr * 0.78 + repoRr * 0.22 + gauss3(ra, rb, rc) * 3.2
  } else {
    rr = repoRr + gauss3(ra, rb, rc) * 3.5
    ang = spiralAngle(h, rr, a, b, cc)
  }

  rr = Math.max(1.8, Math.min(R_MAX * 0.98, rr))

  const t = (rr - R_MIN) / (R_MAX - R_MIN + 1)
  const act = activityFactor(item.pushedAt)
  const starNorm =
    Math.log1p(Number(item.stars) || 0) / Math.log1p(Math.max(maxStars, 1))
  const y = diskHeight(h, { rr, ang, t, ySeed: [ya, yb, yc], starNorm, act })
  const [ox, oy, oz] = volumeOffset(h, {
    ySeed: [ya, yb, yc],
    rSeed: [ra, rb, rc],
  })
  const sf = layout?.spreadFactor ?? 1

  return [
    (Math.cos(ang) * rr + ox) * sf,
    (y + oy) * sf,
    (Math.sin(ang) * rr + oz) * sf,
  ]
}
