import { COSMIC_UNIVERSE, FORCE_LAYOUT, MORPHOLOGY_LAYOUT } from './constants'
import {
  buildCosmicLanguageField,
  layoutLanguageKey,
  sampleCosmicFieldPosition,
  sampleCosmicVoid,
} from './galaxy-field.js'
import { gauss3, hashSeed, hashStr, hashUnit } from './hash'

function buildCosmicRepoAnchors(repos, layout) {
  const sf = Math.min(layout.spreadFactor ?? 1, 1.32)
  const total = Math.max(repos.length, 1)
  const field = buildCosmicLanguageField(layout, total)
  /** @type {Map<string, [number, number, number]>} */
  const repoPosById = new Map()
  const span = field.span
  const { INTERGALACTIC_RATIO, VOLUME_SCALE } = {
    ...COSMIC_UNIVERSE,
    VOLUME_SCALE: MORPHOLOGY_LAYOUT.VOLUME_SCALE,
  }

  for (const item of repos) {
    const id = item?.id
    if (!id) continue

    const h = hashStr(id)
    let x
    let y
    let z

    if (hashUnit(h, 0) < INTERGALACTIC_RATIO) {
      ;[x, y, z] = sampleCosmicVoid(h, span)
    } else {
      ;[x, y, z] = sampleCosmicFieldPosition(item, h, field, layout)
    }

    x *= sf
    y *= sf
    z *= sf

    const jitter = span * 0.022 * VOLUME_SCALE
    x +=
      gauss3(hashSeed(h, 'jx1'), hashSeed(h, 'jx2'), hashSeed(h, 'jx3')) *
      jitter
    y +=
      gauss3(hashSeed(h, 'jy1'), hashSeed(h, 'jy2'), hashSeed(h, 'jy3')) *
      jitter *
      0.78
    z +=
      gauss3(hashSeed(h, 'jz1'), hashSeed(h, 'jz2'), hashSeed(h, 'jz3')) *
      jitter

    repoPosById.set(id, [x, y, z])
  }

  return repoPosById
}

function topicClusterKey(v, layout) {
  if (!v.topic) return ''
  const lang = layoutLanguageKey(v.item ?? v, layout)
  return `${lang}\0${v.topic}`
}

/** 按语言+topic 聚合开放星团中心（团心 = 成员仓锚点质心） */
function buildTopicClusterCenters(virtualStars, repoPosById, layout) {
  /** @type {Map<string, { sx: number, sy: number, sz: number, repoN: number }>} */
  const acc = new Map()
  /** @type {Map<string, Set<string>>} */
  const seenRepos = new Map()

  for (const v of virtualStars) {
    if (!v.topic) continue
    const key = topicClusterKey(v, layout)
    const base = repoPosById.get(v.repoId)
    if (!base) continue
    if (!acc.has(key)) {
      acc.set(key, { sx: 0, sy: 0, sz: 0, repoN: 0 })
      seenRepos.set(key, new Set())
    }
    const repos = seenRepos.get(key)
    if (repos.has(v.repoId)) continue
    repos.add(v.repoId)
    const m = acc.get(key)
    m.sx += base[0]
    m.sy += base[1]
    m.sz += base[2]
    m.repoN += 1
  }

  /** @type {Map<string, [number, number, number, number]>} */
  const centers = new Map()
  for (const [key, m] of acc) {
    if (m.repoN > 0) {
      centers.set(key, [
        m.sx / m.repoN,
        m.sy / m.repoN,
        m.sz / m.repoN,
        m.repoN,
      ])
    }
  }
  return centers
}

function openClusterSpread(repoCount, sf) {
  const { CLUSTER_SPREAD_MIN, CLUSTER_SPREAD_MAX, CLUSTER_SPREAD_LOG } =
    MORPHOLOGY_LAYOUT
  const logN = Math.log1p(Math.max(repoCount, 1))
  return (
    Math.min(
      CLUSTER_SPREAD_MAX,
      CLUSTER_SPREAD_MIN + logN * CLUSTER_SPREAD_LOG,
    ) * sf
  )
}

/** 开放星团成员：三维高斯弥散 + 丝状扰动，锚定所属仓 */
function placeOpenClusterStar(
  v,
  repoAnchor,
  clusterCenter,
  repoCount,
  positions,
  i,
  sf,
) {
  const h = hashStr(v.virtualKey)
  const { CLUSTER_WISP } = COSMIC_UNIVERSE
  const spread = openClusterSpread(repoCount, sf)
  const [rax, ray, raz] = repoAnchor
  const blend = 0.62
  const ax = clusterCenter[0] * (1 - blend) + rax * blend
  const ay = clusterCenter[1] * (1 - blend) + ray * blend
  const az = clusterCenter[2] * (1 - blend) + raz * blend

  let px =
    ax +
    gauss3(hashSeed(h, 'nx1'), hashSeed(h, 'nx2'), hashSeed(h, 'nx3')) * spread
  let py =
    ay +
    gauss3(hashSeed(h, 'ny1'), hashSeed(h, 'ny2'), hashSeed(h, 'ny3')) *
      spread *
      0.62
  let pz =
    az +
    gauss3(hashSeed(h, 'nz1'), hashSeed(h, 'nz2'), hashSeed(h, 'nz3')) * spread

  const wisp = spread * CLUSTER_WISP
  const stretch = hashUnit(h, 11) * Math.PI * 2
  px +=
    Math.cos(stretch) *
    gauss3(hashSeed(h, 'cx'), hashSeed(h, 'cy'), hashSeed(h, 'cz')) *
    wisp
  py +=
    gauss3(hashSeed(h, 'y4'), hashSeed(h, 'y5'), hashSeed(h, 'y6')) *
    wisp *
    0.72
  pz +=
    Math.sin(stretch) *
    gauss3(hashSeed(h, 'cz1'), hashSeed(h, 'cz2'), hashSeed(h, 'cz3')) *
    wisp

  positions[i * 3] = px
  positions[i * 3 + 1] = py
  positions[i * 3 + 2] = pz
}

/** 场星 / 无 topic 仓：锚点附近小抖动 */
function placeRepoStar(repoAnchor, positions, i, h, sf) {
  const { REPO_JITTER_MIN, REPO_JITTER_MAX } = MORPHOLOGY_LAYOUT
  const jitter =
    REPO_JITTER_MIN + hashUnit(h, 7) * (REPO_JITTER_MAX - REPO_JITTER_MIN)
  const s = jitter * sf
  positions[i * 3] =
    repoAnchor[0] +
    gauss3(hashSeed(h, 'rx1'), hashSeed(h, 'rx2'), hashSeed(h, 'rx3')) * s
  positions[i * 3 + 1] =
    repoAnchor[1] +
    gauss3(hashSeed(h, 'ry1'), hashSeed(h, 'ry2'), hashSeed(h, 'ry3')) *
      s *
      0.55
  positions[i * 3 + 2] =
    repoAnchor[2] +
    gauss3(hashSeed(h, 'rz1'), hashSeed(h, 'rz2'), hashSeed(h, 'rz3')) * s
}

/** 同仓多 topic：聚星极近距偏移 */
function applyMultiTopicSibling(
  v,
  repoAnchor,
  topicSlot,
  topicCount,
  positions,
  i,
  sf,
) {
  if (topicCount <= 1 || !v.topic) return
  const h = hashStr(v.virtualKey)
  const { MULTI_TOPIC_SIBLING } = COSMIC_UNIVERSE
  const sibling = sf * MULTI_TOPIC_SIBLING * (0.22 + topicCount * 0.06)
  positions[i * 3] +=
    gauss3(hashSeed(h, 'st1'), hashSeed(h, 'st2'), hashSeed(h, 'st3')) *
      sibling +
    topicSlot * sibling * 0.08
  positions[i * 3 + 1] +=
    gauss3(hashSeed(h, 'st4'), hashSeed(h, 'st5'), hashSeed(h, 'st6')) *
    sibling *
    0.45
  positions[i * 3 + 2] +=
    gauss3(hashSeed(h, 'st7'), hashSeed(h, 'st8'), hashSeed(h, 'st9')) * sibling
}

function placeDustStar(base, spread, positions, i, h) {
  const dust = spread * (1.05 + hashUnit(h, 21) * 1.45)
  positions[i * 3] =
    base[0] +
    gauss3(hashSeed(h, 'd1'), hashSeed(h, 'd2'), hashSeed(h, 'd3')) * dust
  positions[i * 3 + 1] =
    base[1] +
    gauss3(hashSeed(h, 'd4'), hashSeed(h, 'd5'), hashSeed(h, 'd6')) *
      dust *
      0.82
  positions[i * 3 + 2] =
    base[2] +
    gauss3(hashSeed(h, 'd7'), hashSeed(h, 'd8'), hashSeed(h, 'd9')) * dust
}

/**
 * 宇宙布局：多星系 + 开放星团 + 场星
 */
export function buildMorphologicalVirtualPositions(
  repos,
  virtualStars,
  layout,
  _ringKeys,
) {
  const n = virtualStars?.length ?? 0
  const positions = new Float32Array(n * 3)
  if (!n) return positions

  const repoPosById = buildCosmicRepoAnchors(repos, layout)
  const clusterCenters = buildTopicClusterCenters(
    virtualStars,
    repoPosById,
    layout,
  )

  /** @type {Map<string, number>} */
  const repoTopicCounts = new Map()
  for (const v of virtualStars) {
    if (!v.topic) continue
    repoTopicCounts.set(v.repoId, (repoTopicCounts.get(v.repoId) || 0) + 1)
  }

  const { DUST_RATIO } = MORPHOLOGY_LAYOUT
  const sf = layout.spreadFactor ?? 1
  /** @type {Map<string, number>} */
  const repoTopicSlot = new Map()

  for (let i = 0; i < n; i += 1) {
    const v = virtualStars[i]
    const repoAnchor = repoPosById.get(v.repoId) ?? [0, 0, 0]
    const h = hashStr(v.virtualKey)
    const clusterKey = topicClusterKey(v, layout)
    const cluster = clusterKey ? clusterCenters.get(clusterKey) : null

    if (hashUnit(h, 20) < DUST_RATIO) {
      placeDustStar(
        repoAnchor,
        openClusterSpread(cluster?.[3] ?? 1, sf),
        positions,
        i,
        h,
      )
    } else if (cluster && v.topic) {
      placeOpenClusterStar(v, repoAnchor, cluster, cluster[3], positions, i, sf)
    } else {
      placeRepoStar(repoAnchor, positions, i, h, sf)
    }

    const topicCount = repoTopicCounts.get(v.repoId) || 1
    if (topicCount > 1 && v.topic) {
      const slot = repoTopicSlot.get(v.repoId) ?? 0
      repoTopicSlot.set(v.repoId, slot + 1)
      applyMultiTopicSibling(v, repoAnchor, slot, topicCount, positions, i, sf)
    }
  }

  return positions
}

/**
 * 质心归零 + 温和缩放
 */
export function harmonizeCosmicSpan(positions, count, auxBuffers = []) {
  if (count <= 0) return null
  const targetSpan = FORCE_LAYOUT.TARGET_SPAN
  const yFlatten = COSMIC_UNIVERSE.UNIVERSE_Y_FLATTEN

  let cx = 0
  let cy = 0
  let cz = 0
  for (let i = 0; i < count; i += 1) {
    cx += positions[i * 3]
    cy += positions[i * 3 + 1]
    cz += positions[i * 3 + 2]
  }
  const inv = 1 / count
  cx *= inv
  cy *= inv
  cz *= inv

  const radii = new Float32Array(count)
  let maxR = 1
  for (let i = 0; i < count; i += 1) {
    const x = positions[i * 3] - cx
    const y = positions[i * 3 + 1] - cy
    const z = positions[i * 3 + 2] - cz
    const r = Math.sqrt(x * x + y * y + z * z)
    radii[i] = r
    maxR = Math.max(maxR, r)
  }

  const sorted = [...radii].sort((a, b) => a - b)
  const p88 = sorted[Math.min(count - 1, Math.floor(count * 0.88))] || maxR
  const desired = targetSpan * 0.92
  const effectiveR = Math.max(p88 * 1.02, maxR * 0.78)
  let scale = desired / effectiveR
  if (scale > 1.14) scale = 1.14

  const applyScale = (buf, n) => {
    for (let i = 0; i < n; i += 1) {
      buf[i * 3] = (buf[i * 3] - cx) * scale
      buf[i * 3 + 1] = (buf[i * 3 + 1] - cy) * scale * yFlatten
      buf[i * 3 + 2] = (buf[i * 3 + 2] - cz) * scale
    }
  }

  applyScale(positions, count)
  for (const aux of auxBuffers) {
    if (!aux?.buf || aux.n <= 0) continue
    applyScale(aux.buf, aux.n)
  }

  return { cx, cy, cz, scale, yFlatten }
}
