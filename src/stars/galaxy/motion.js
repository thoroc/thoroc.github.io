import { COSMIC_UNIVERSE, GALAXY_MOTION } from './constants'
import { hashStr, hashUnit } from './hash'
import { buildLanguageHubMotion } from './motion-hubs.js'
import { motionSign, rotateTiltedY, rotateY } from './motion-math.js'
import { virtualLanguageKey } from './virtual-stars.js'

export { GALAXY_HUB_MOTION_GLSL, GALAXY_MOTION_GLSL } from './motion-glsl.js'
export {
  applyGalaxyHubMotionJs,
  buildHarmonizedLanguageHubs,
  buildHarmonizedRawLanguageHubs,
} from './motion-hubs.js'

function xzRadius(x, z) {
  return Math.sqrt(x * x + z * z)
}

function virtualTopicKey(v, layout) {
  const lang = virtualLanguageKey(v, layout)
  const topic = v.topic || '__none__'
  return `${lang}\0${topic}`
}

function isIntergalacticRepo(repoId) {
  return hashUnit(hashStr(repoId), 0) < COSMIC_UNIVERSE.INTERGALACTIC_RATIO
}

/**
 * 运动字段：宇宙漂移 + 星系差动自转 + 星团微自转（无嵌套公转）
 */
export function buildMotionFields(
  list,
  positions,
  count,
  layout,
  ringKeys = new Set(),
  langHubOverrides = null,
) {
  const rawHubs = buildLanguageGalaxyHubs(layout)
  const span = 72

  /** @type {Map<string, { cx: number, cy: number, cz: number, count: number }>} */
  const topicMeta = new Map()
  /** @type {Map<string, { cx: number, cy: number, cz: number, count: number }>} */
  const repoMeta = new Map()

  for (let i = 0; i < count; i += 1) {
    const v = list[i]
    const topicKey = virtualTopicKey(v, layout)
    if (!topicMeta.has(topicKey))
      topicMeta.set(topicKey, { cx: 0, cy: 0, cz: 0, count: 0 })
    const tm = topicMeta.get(topicKey)
    tm.cx += positions[i * 3]
    tm.cy += positions[i * 3 + 1]
    tm.cz += positions[i * 3 + 2]
    tm.count += 1

    if (!repoMeta.has(v.repoId))
      repoMeta.set(v.repoId, { cx: 0, cy: 0, cz: 0, count: 0 })
    const rm = repoMeta.get(v.repoId)
    rm.cx += positions[i * 3]
    rm.cy += positions[i * 3 + 1]
    rm.cz += positions[i * 3 + 2]
    rm.count += 1
  }

  let maxTopicCount = 1
  for (const meta of topicMeta.values()) {
    maxTopicCount = Math.max(maxTopicCount, meta.count)
    const inv = 1 / meta.count
    meta.cx *= inv
    meta.cy *= inv
    meta.cz *= inv
  }
  for (const meta of repoMeta.values()) {
    const inv = 1 / meta.count
    meta.cx *= inv
    meta.cy *= inv
    meta.cz *= inv
  }

  const galaxyHubs = new Float32Array(count * 3)
  const nebulaCenters = new Float32Array(count * 3)
  const motionOmega = new Float32Array(count * 4)
  const motionOmega2 = new Float32Array(count * 4)
  const yBobAmp = new Float32Array(count)
  const yBobPhase = new Float32Array(count)

  const {
    SPEED_SCALE,
    HUB_ORBIT_BASE,
    HUB_ORBIT_SPREAD,
    GALAXY_SPIN_BASE,
    GALAXY_SPIN_SPREAD,
    GALAXY_ORBIT_BASE,
    GALAXY_ORBIT_SPREAD,
    CLUSTER_SPIN_BASE,
    CLUSTER_SPIN_SPREAD,
    CLUSTER_ORBIT_BASE,
    CLUSTER_ORBIT_SPREAD,
    TOPIC_MIN_COUNT,
    STAR_BOB_BASE,
    STAR_BOB_SPREAD,
    FIELD_UNIVERSE_MULT,
    FIELD_GALAXY_MULT,
  } = GALAXY_MOTION
  const motionScale = SPEED_SCALE ?? 1

  for (let i = 0; i < count; i += 1) {
    const v = list[i]
    const lang = virtualLanguageKey(v, layout)
    const topicKey = virtualTopicKey(v, layout)
    const hStar = hashStr(v.virtualKey)
    const hLang = hashStr(`cosmic-motion:${lang}`)
    const hTopic = hashStr(`cluster-motion:${topicKey}`)
    const hRepo = hashStr(`repo-motion:${v.repoId}`)

    const px = positions[i * 3]
    const py = positions[i * 3 + 1]
    const pz = positions[i * 3 + 2]
    const starSign =
      motionSign(v.virtualKey) * (hashUnit(hStar, 3) > 0.5 ? 1 : -1)
    const langSign = motionSign(lang) * (hashUnit(hLang, 4) > 0.5 ? 1 : -1)
    const topicSign = motionSign(topicKey) * starSign

    const hub = langHubOverrides?.get(lang) ?? rawHubs.get(lang) ?? [0, 0, 0]
    const intergalactic = isIntergalacticRepo(v.repoId)

    galaxyHubs[i * 3] = intergalactic ? px * 0.15 : hub[0]
    galaxyHubs[i * 3 + 1] = intergalactic ? py * 0.15 : hub[1]
    galaxyHubs[i * 3 + 2] = intergalactic ? pz * 0.15 : hub[2]

    const tm = topicMeta.get(topicKey)
    const rm = repoMeta.get(v.repoId)
    const topicCount = tm?.count ?? 1
    const useTopicCluster = v.topic && topicCount >= TOPIC_MIN_COUNT && tm

    if (useTopicCluster) {
      nebulaCenters[i * 3] = tm.cx
      nebulaCenters[i * 3 + 1] = tm.cy
      nebulaCenters[i * 3 + 2] = tm.cz
    } else if (rm) {
      nebulaCenters[i * 3] = rm.cx
      nebulaCenters[i * 3 + 1] = rm.cy
      nebulaCenters[i * 3 + 2] = rm.cz
    } else {
      nebulaCenters[i * 3] = px
      nebulaCenters[i * 3 + 1] = py
      nebulaCenters[i * 3 + 2] = pz
    }

    const hubDist = Math.hypot(hub[0], hub[2])
    const hubFactor = 18 / Math.max(hubDist, span * 0.12) ** 0.55
    const langGalaxySpin =
      langSign *
      GALAXY_SPIN_BASE *
      (0.42 + hashUnit(hLang, 2) * GALAXY_SPIN_SPREAD) *
      (14 / Math.max(hubDist, 5.5))
    const langGalaxyOrbit =
      langSign *
      GALAXY_ORBIT_BASE *
      (0.4 + hashUnit(hLang, 5) * GALAXY_ORBIT_SPREAD)

    const universeMult = intergalactic ? FIELD_UNIVERSE_MULT : 1
    const galaxyMult = intergalactic ? FIELD_GALAXY_MULT : 1

    const universeOrbit =
      langSign *
      HUB_ORBIT_BASE *
      hubFactor *
      (0.45 + hashUnit(hLang, 1) * HUB_ORBIT_SPREAD) *
      universeMult
    const galaxySpin = langGalaxySpin * galaxyMult
    const clusterSpin = useTopicCluster
      ? topicSign *
        CLUSTER_SPIN_BASE *
        (0.35 +
          hashUnit(hTopic, 1) *
            CLUSTER_SPIN_SPREAD *
            (0.45 +
              ((topicCount - TOPIC_MIN_COUNT) /
                Math.max(maxTopicCount - TOPIC_MIN_COUNT, 1)) *
                0.75))
      : 0
    const starSpin = 0

    motionOmega[i * 4] = universeOrbit * motionScale
    motionOmega[i * 4 + 1] = galaxySpin * motionScale
    motionOmega[i * 4 + 2] = clusterSpin * motionScale
    motionOmega[i * 4 + 3] = starSpin * motionScale

    const galaxyOrbit = langGalaxyOrbit * galaxyMult
    const clusterOrbit =
      topicSign *
      CLUSTER_ORBIT_BASE *
      (0.28 + hashUnit(hTopic, 3) * CLUSTER_ORBIT_SPREAD)
    const starOrbit = 0
    const tiltMix = hashUnit(hRepo, 6) * Math.PI * 2

    motionOmega2[i * 4] = galaxyOrbit * motionScale
    motionOmega2[i * 4 + 1] = clusterOrbit * motionScale
    motionOmega2[i * 4 + 2] = starOrbit * motionScale
    motionOmega2[i * 4 + 3] = tiltMix

    yBobAmp[i] =
      (STAR_BOB_BASE + hashUnit(hStar, 12) * STAR_BOB_SPREAD) * motionScale
    yBobPhase[i] = hashUnit(hStar, 11) * Math.PI * 2
  }

  return {
    galaxyHubs,
    nebulaCenters,
    motionOmega,
    motionOmega2,
    yBobAmp,
    yBobPhase,
  }
}

function applyHierarchicalMotion(rx, ry, rz, fields, i, time) {
  const {
    galaxyHubs,
    nebulaCenters,
    motionOmega,
    motionOmega2,
    yBobAmp,
    yBobPhase,
  } = fields

  const hubX = galaxyHubs[i * 3]
  const hubY = galaxyHubs[i * 3 + 1]
  const hubZ = galaxyHubs[i * 3 + 2]
  const nebX = nebulaCenters[i * 3]
  const nebY = nebulaCenters[i * 3 + 1]
  const nebZ = nebulaCenters[i * 3 + 2]

  const universeOrbit = motionOmega[i * 4]
  const galaxySpin = motionOmega[i * 4 + 1]
  const clusterSpin = motionOmega[i * 4 + 2]

  const galaxyOrbit = motionOmega2[i * 4]
  const clusterOrbit = motionOmega2[i * 4 + 1]
  const tiltMix = motionOmega2[i * 4 + 3]

  const galTilt = tiltMix * 0.12
  const clusterTilt = (hashUnit(hashStr(`cl-tilt:${i}`), 0) - 0.5) * 0.12

  let x = rx
  let y = ry
  let z = rz

  if (clusterSpin !== 0 || clusterOrbit !== 0) {
    let relCx = x - nebX
    let relCy = y - nebY
    let relCz = z - nebZ
    ;[relCx, relCy, relCz] = rotateTiltedY(
      relCx,
      relCy,
      relCz,
      time * clusterSpin,
      clusterTilt,
    )
    if (clusterOrbit !== 0) {
      ;[relCx, relCy, relCz] = rotateY(relCx, relCy, relCz, time * clusterOrbit)
    }
    x = nebX + relCx
    y = nebY + relCy
    z = nebZ + relCz
  }

  let relGx = x - hubX
  let relGy = y - hubY
  let relGz = z - hubZ
  const galR = Math.max(xzRadius(relGx, relGz), 6)
  const diffSpin = galaxySpin * (1.15 / galR ** 0.38)
  ;[relGx, relGy, relGz] = rotateTiltedY(
    relGx,
    relGy,
    relGz,
    time * diffSpin,
    galTilt,
  )
  if (galaxyOrbit !== 0) {
    ;[relGx, relGy, relGz] = rotateY(relGx, relGy, relGz, time * galaxyOrbit)
  }
  x = hubX + relGx
  y = hubY + relGy + Math.sin(time * diffSpin * 0.6 + yBobPhase[i]) * yBobAmp[i]
  z = hubZ + relGz

  ;[x, y, z] = rotateY(x, y, z, time * universeOrbit)

  return [x, y, z]
}

export function motionWorldPosition(rx, ry, rz, fields, i, time) {
  return applyHierarchicalMotion(rx, ry, rz, fields, i, time)
}

/** 为气体云粒子填充星系级运动字段 */
export function fillGasMotionFields(gasBuffers, layout, harmonizedHubs) {
  if (!gasBuffers?.count) return
  const langs = gasBuffers.languages || []
  const perGalaxy =
    gasBuffers.perGalaxy ?? COSMIC_UNIVERSE.GAS_PARTICLES_PER_GALAXY
  const corePerGalaxy =
    gasBuffers.corePerGalaxy ?? COSMIC_UNIVERSE.GAS_CORE_FILL_COUNT ?? 0
  const particlesPerLayer = perGalaxy + corePerGalaxy
  const count = gasBuffers.count
  const galaxyHubs = new Float32Array(count * 3)
  const motionOmega = new Float32Array(count * 4)
  const motionOmega2 = new Float32Array(count * 4)

  let o = 0
  for (const lang of langs) {
    const hub = harmonizedHubs.get(lang) ?? [0, 0, 0]
    const m = buildLanguageHubMotion(layout, lang, hub)
    for (let j = 0; j < particlesPerLayer; j += 1) {
      galaxyHubs[o * 3] = hub[0]
      galaxyHubs[o * 3 + 1] = hub[1]
      galaxyHubs[o * 3 + 2] = hub[2]
      motionOmega[o * 4] = m.universeOrbit
      motionOmega[o * 4 + 1] = m.galaxySpin
      motionOmega[o * 4 + 2] = 0
      motionOmega[o * 4 + 3] = 0
      motionOmega2[o * 4] = m.galaxyOrbit
      motionOmega2[o * 4 + 1] = 0
      motionOmega2[o * 4 + 2] = 0
      motionOmega2[o * 4 + 3] = m.tiltMix
      o += 1
    }
  }

  gasBuffers.galaxyHubs = galaxyHubs
  gasBuffers.motionOmega = motionOmega
  gasBuffers.motionOmega2 = motionOmega2
  gasBuffers.languages = [...langs]
  gasBuffers.perGalaxy = perGalaxy
  gasBuffers.corePerGalaxy = corePerGalaxy
  gasBuffers.langMotions = langs.map((lang) => {
    const hub = harmonizedHubs.get(lang) ?? [0, 0, 0]
    const m = buildLanguageHubMotion(layout, lang, hub)
    return {
      hub,
      omega: [m.universeOrbit, m.galaxySpin, 0, 0],
      omega2: [m.galaxyOrbit, 0, 0, m.tiltMix],
    }
  })
}
