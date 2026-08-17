import { GALAXY_MOTION } from '../constants'
import { buildLanguageGalaxyHubs } from '../galaxy-field'
import { hashStr, hashUnit } from '../hash'
import { motionSign } from '../motion-math'
import { virtualLanguageKey } from '../virtual-stars'
import { isIntergalacticRepo } from './isIntergalacticRepo'
import type { LayoutLike, MotionFields, Vec3, VirtualStarLike } from './types'
import { virtualTopicKey } from './virtualTopicKey'

interface CentroidAccumulator {
  cx: number
  cy: number
  cz: number
  count: number
}

/** 运动字段：宇宙漂移 + 星系差动自转 + 星团微自转（无嵌套公转） */
export const buildMotionFields = (
  list: VirtualStarLike[],
  positions: Float32Array,
  count: number,
  layout: LayoutLike,
  _ringKeys: Set<string> = new Set(),
  langHubOverrides: Map<string, Vec3> | null = null,
): MotionFields => {
  const rawHubs = buildLanguageGalaxyHubs(layout)
  const span = 72

  const topicMeta = new Map<string, CentroidAccumulator>()
  const repoMeta = new Map<string, CentroidAccumulator>()

  for (let i = 0; i < count; i += 1) {
    const v = list[i] as VirtualStarLike
    const topicKey = virtualTopicKey(v, layout)
    if (!topicMeta.has(topicKey))
      topicMeta.set(topicKey, { cx: 0, cy: 0, cz: 0, count: 0 })
    const tm = topicMeta.get(topicKey) as CentroidAccumulator
    tm.cx += positions[i * 3] as number
    tm.cy += positions[i * 3 + 1] as number
    tm.cz += positions[i * 3 + 2] as number
    tm.count += 1

    if (!repoMeta.has(v.repoId))
      repoMeta.set(v.repoId, { cx: 0, cy: 0, cz: 0, count: 0 })
    const rm = repoMeta.get(v.repoId) as CentroidAccumulator
    rm.cx += positions[i * 3] as number
    rm.cy += positions[i * 3 + 1] as number
    rm.cz += positions[i * 3 + 2] as number
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
    const v = list[i] as VirtualStarLike
    const lang = virtualLanguageKey(v, layout)
    const topicKey = virtualTopicKey(v, layout)
    const hStar = hashStr(v.virtualKey)
    const hLang = hashStr(`cosmic-motion:${lang}`)
    const hTopic = hashStr(`cluster-motion:${topicKey}`)
    const hRepo = hashStr(`repo-motion:${v.repoId}`)

    const px = positions[i * 3] as number
    const py = positions[i * 3 + 1] as number
    const pz = positions[i * 3 + 2] as number
    const starSign =
      motionSign(v.virtualKey) * (hashUnit(hStar, 3) > 0.5 ? 1 : -1)
    const langSign = motionSign(lang) * (hashUnit(hLang, 4) > 0.5 ? 1 : -1)
    const topicSign = motionSign(topicKey) * starSign

    const hub = langHubOverrides?.get(lang) ??
      (rawHubs.get(lang) as Vec3 | undefined) ?? [0, 0, 0]
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
