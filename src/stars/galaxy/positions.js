import { repoLangRgb } from './colors.js'
import { COSMIC_UNIVERSE, GALAXY, R_MAX, R_MIN } from './constants'
import { findAnchorRepoId } from './force-similarity'
import {
  buildGalaxyGasBuffers,
  buildGalaxyGasDustBuffers,
} from './gas-buffers.js'
import { hashStr, hashUnit } from './hash'
import {
  extractVirtualLayoutPositions,
  hasValidGalaxyLayout,
} from './layout-payload.js'
import {
  buildLanguageGalaxyHubs,
  buildMorphologicalVirtualPositions,
  harmonizeCosmicSpan,
} from './morphological-layout.js'
import {
  buildHarmonizedLanguageHubs,
  buildHarmonizedRawLanguageHubs,
  buildMotionFields,
  fillGasMotionFields,
} from './motion.js'
import {
  buildLanguageLayout,
  buildTwinkleActivities,
  repoVisualInfluence,
  virtualStarRgb,
} from './repo-position.js'
import {
  buildLanguageLegend,
  buildStarSizes,
  buildStarTierLegend,
  repoBrightness,
} from './star-visuals.js'
import {
  applyTopicRingRefinement,
  buildRepoIdToVirtualIndices,
  buildTopicRingKeySet,
  expandReposToVirtualStars,
  topicRingKey,
  virtualLanguageKey,
} from './virtual-stars.js'

export { buildLanguageLayout } from './repo-position.js'
export {
  ownerSelfRepoId,
  repoLegendLanguageKey,
  repoStarTierKey,
} from './star-visuals.js'

/**
 * 分层摆位：语言星系 → 开放星团（topic）→ 单星（仓）
 * @param {Array<object>} repos
 * @param {import('./virtual-stars.js').VirtualStar[]} virtualStars
 * @param {ReturnType<typeof buildLanguageLayout>} layout
 * @param {Set<string>} ringKeys
 */
export function buildStructuredVirtualPositions(
  repos,
  virtualStars,
  layout,
  ringKeys,
  gasBuffers,
  ringStarFlags = null,
  gasDustBuffers = null,
) {
  const positions = buildMorphologicalVirtualPositions(
    repos,
    virtualStars,
    layout,
    ringKeys,
  )
  /** @type {Array<{ buf: Float32Array, n: number }>} */
  const aux = []
  if (gasBuffers?.count > 0) {
    aux.push({ buf: gasBuffers.positions, n: gasBuffers.count })
  }
  if (gasDustBuffers?.count > 0) {
    aux.push({ buf: gasDustBuffers.positions, n: gasDustBuffers.count })
  }
  const harmonizeMeta = harmonizeCosmicSpan(positions, virtualStars.length, aux)
  const hubs =
    buildHarmonizedRawLanguageHubs(layout, harmonizeMeta) ??
    buildLanguageGalaxyHubs(layout)
  applyTopicRingRefinement(virtualStars, positions, layout, ringKeys, {
    totalRepos: repos?.length ?? 0,
    hubs,
    ringStarFlags,
  })
  return { positions, harmonizeMeta }
}

function scanRepoMaxima(repos) {
  let maxStars = 1
  let maxForks = 1
  let maxWatchers = 1
  for (const item of repos) {
    maxStars = Math.max(maxStars, Number(item.stars) || 0)
    maxForks = Math.max(maxForks, Number(item.forksCount) || 0)
    maxWatchers = Math.max(maxWatchers, Number(item.watchersCount) || 0)
  }
  return { maxStars, maxForks, maxWatchers }
}

function buildRepoActivityById(repos, twinkleCtx) {
  const repoTwinkleActivities = buildTwinkleActivities(repos, twinkleCtx)
  const repoActivityById = new Map()
  for (let i = 0; i < repos.length; i += 1) {
    const id = repos[i]?.id
    if (id) repoActivityById.set(id, repoTwinkleActivities[i])
  }
  return repoActivityById
}

/** 优先复用预计算布局；否则跑结构化摆位并定位锚点仓库 */
function resolveGalaxyPositions(
  repos,
  virtualStars,
  layout,
  ringKeys,
  gasBuffers,
  ringStarFlags,
  gasDustBuffers,
  galaxyCtx,
) {
  const precomputed =
    galaxyCtx?.layout &&
    hasValidGalaxyLayout(galaxyCtx.layout) &&
    galaxyCtx.virtualIndexMap?.size
      ? extractVirtualLayoutPositions(
          virtualStars,
          galaxyCtx.layout,
          galaxyCtx.virtualIndexMap,
        )
      : null

  if (precomputed) {
    return {
      positions: precomputed.positions,
      anchorIndex: precomputed.anchorIndex,
      harmonizeMeta: null,
    }
  }

  const structured = buildStructuredVirtualPositions(
    repos,
    virtualStars,
    layout,
    ringKeys,
    gasBuffers,
    ringStarFlags,
    gasDustBuffers,
  )
  let anchorIndex = -1
  const anchorRepoId = findAnchorRepoId(repos)
  if (anchorRepoId) {
    for (let i = 0; i < virtualStars.length; i += 1) {
      if (virtualStars[i].repoId === anchorRepoId) {
        anchorIndex = i
        break
      }
    }
  }
  return {
    positions: structured.positions,
    anchorIndex,
    harmonizeMeta: structured.harmonizeMeta,
  }
}

/** 逐虚拟星填色/亮度/活跃度/随机种子；锚点仓库额外加成 */
function buildStarVisualBuffers(
  virtualStars,
  sizeCtx,
  sizes,
  anchorIndex,
  repoActivityById,
) {
  const count = virtualStars.length
  const colors = new Float32Array(count * 3)
  const brights = new Float32Array(count)
  const activities = new Float32Array(count)
  const seeds = new Float32Array(count)
  const idToIndex = new Map()

  for (let i = 0; i < count; i += 1) {
    const v = virtualStars[i]
    const item = v.item

    const influence = repoVisualInfluence(item, sizeCtx)
    const [r, g, b] = virtualStarRgb(v, repoLangRgb(item.language), influence)
    const bright = repoBrightness(item, sizeCtx)
    colors[i * 3] = r * (0.78 + bright * 0.42)
    colors[i * 3 + 1] = g * (0.78 + bright * 0.42)
    colors[i * 3 + 2] = b * (0.78 + bright * 0.42)

    brights[i] = bright
    if (i === anchorIndex) {
      sizes[i] *= 1.4
      brights[i] = Math.min(1, brights[i] * 1.12)
      colors[i * 3] *= 1.08
      colors[i * 3 + 1] *= 1.08
      colors[i * 3 + 2] *= 1.08
    }
    activities[i] = repoActivityById.get(v.repoId) ?? 0
    seeds[i] = (hashStr(v.virtualKey) % 1000) / 1000
    if (!idToIndex.has(v.repoId)) {
      idToIndex.set(v.repoId, i)
    }
  }

  return { colors, brights, activities, seeds, idToIndex }
}

/** 语言环加成 + 动效字段（hub 摆位、气体云运动） */
function finalizeGalaxyMotion(
  virtualStars,
  layout,
  ringKeys,
  sizes,
  brights,
  count,
  ringStarFlags,
  positions,
  harmonizeMeta,
  gasBuffers,
  gasDustBuffers,
) {
  if (GALAXY.TOPIC_RINGS_ENABLED) {
    boostTopicRingStars(
      virtualStars,
      layout,
      ringKeys,
      sizes,
      brights,
      count,
      ringStarFlags,
    )
  }

  const langHubOverrides =
    buildHarmonizedRawLanguageHubs(layout, harmonizeMeta) ??
    buildHarmonizedLanguageHubs(layout, virtualStars, positions, count)

  const motion = buildMotionFields(
    virtualStars,
    positions,
    count,
    layout,
    ringKeys,
    langHubOverrides,
  )
  fillGasMotionFields(gasBuffers, layout, langHubOverrides)
  fillGasMotionFields(gasDustBuffers, layout, langHubOverrides)
  return motion
}

export function buildGalaxyBuffers(items, galaxyCtx = null) {
  const repos = items || []
  const virtualStars = expandReposToVirtualStars(repos)
  const count = virtualStars.length

  const { maxStars, maxForks, maxWatchers } = scanRepoMaxima(repos)
  const twinkleCtx = { maxStars, maxForks, maxWatchers }
  const sizeCtx = { maxStars, maxForks, maxWatchers }
  const repoActivityById = buildRepoActivityById(repos, twinkleCtx)

  const layout = buildLanguageLayout(repos)
  const ringKeys = buildTopicRingKeySet(virtualStars, layout)

  const gasBuffers = buildGalaxyGasBuffers(layout, repos)
  const gasDustBuffers = buildGalaxyGasDustBuffers(layout, repos)
  const ringStarFlags = new Float32Array(count)

  const { positions, anchorIndex, harmonizeMeta } = resolveGalaxyPositions(
    repos,
    virtualStars,
    layout,
    ringKeys,
    gasBuffers,
    ringStarFlags,
    gasDustBuffers,
    galaxyCtx,
  )

  const sizes = buildStarSizes(
    virtualStars.map((v) => v.item),
    sizeCtx,
  )
  const { colors, brights, activities, seeds, idToIndex } =
    buildStarVisualBuffers(
      virtualStars,
      sizeCtx,
      sizes,
      anchorIndex,
      repoActivityById,
    )
  const repoIdToIndices = buildRepoIdToVirtualIndices(virtualStars)

  const motion = finalizeGalaxyMotion(
    virtualStars,
    layout,
    ringKeys,
    sizes,
    brights,
    count,
    ringStarFlags,
    positions,
    harmonizeMeta,
    gasBuffers,
    gasDustBuffers,
  )

  return {
    count,
    maxStars,
    positions,
    colors,
    sizes,
    brights,
    activities,
    seeds,
    idToIndex,
    repoIdToIndices,
    items: virtualStars.map((v) => v.item),
    virtualStars,
    ringKeys,
    legend: buildLanguageLegend(repos),
    starTiers: buildStarTierLegend(repos),
    motion,
    anchorIndex,
    gas: gasBuffers,
    gasDust: gasDustBuffers,
    ringStarFlags,
  }
}

function boostTopicRingStars(
  virtualStars,
  layout,
  ringKeys,
  sizes,
  brights,
  count,
  ringStarFlags = null,
) {
  if (!ringKeys?.size || !count) return
  for (let i = 0; i < count; i += 1) {
    const v = virtualStars[i]
    if (!v.topic) continue
    const lang = virtualLanguageKey(v, layout)
    if (!ringKeys.has(topicRingKey(lang, v.topic))) continue
    if (ringStarFlags && ringStarFlags[i] < 0.5) continue
    sizes[i] *= 1.06
    brights[i] = Math.min(1, brights[i] * 1.1)
  }
}

export function buildDustBuffers(count = 1600) {
  const positions = new Float32Array(count * 3)
  const sizes = new Float32Array(count)
  const span = R_MAX - R_MIN
  const { INTERGALACTIC_SPREAD } = COSMIC_UNIVERSE

  for (let i = 0; i < count; i += 1) {
    const h = hashStr(`dust-${i}`)
    const theta = hashUnit(h, 1) * Math.PI * 2
    const phi = Math.acos(Math.max(-1, Math.min(1, 2 * hashUnit(h, 2) - 1)))
    const r =
      span *
      INTERGALACTIC_SPREAD *
      Math.cbrt(hashUnit(h, 3)) *
      (0.65 + hashUnit(h, 4) * 0.55)

    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
    positions[i * 3 + 1] = r * Math.cos(phi)
    positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta)
    sizes[i] = 0.1 + hashUnit(h, 6) * 0.18
  }
  return { positions, sizes }
}
