import { GALAXY_MOTION } from './constants'
import { hashStr, hashUnit } from './hash'
import { buildLanguageGalaxyHubs } from './morphological-layout.js'
import { motionSign, rotateTiltedY, rotateY } from './motion-math.js'
import { virtualLanguageKey } from './virtual-stars.js'

export function buildHarmonizedRawLanguageHubs(layout, harmonizeMeta) {
  if (!harmonizeMeta) return null
  const rawHubs = buildLanguageGalaxyHubs(layout)
  const { cx, cy, cz, scale, yFlatten } = harmonizeMeta
  /** @type {Map<string, [number, number, number]>} */
  const hubs = new Map()
  for (const [lang, hub] of rawHubs) {
    hubs.set(lang, [
      (hub[0] - cx) * scale,
      (hub[1] - cy) * scale * yFlatten,
      (hub[2] - cz) * scale,
    ])
  }
  return hubs
}

/** 与 applyGalaxyHubMotion 一致的 JS 实现（气体云每帧摆位） */
export function applyGalaxyHubMotionJs(
  x,
  y,
  z,
  hub,
  motionOmega,
  motionOmega2,
  time,
) {
  const universeOrbit = time * motionOmega[0]
  const galaxySpin = time * motionOmega[1]
  const galaxyOrbit = time * motionOmega2[0]
  const tiltMix = motionOmega2[3]
  const galTilt = tiltMix * 0.18

  let relGx = x - hub[0]
  let relGy = y - hub[1]
  let relGz = z - hub[2]
  ;[relGx, relGy, relGz] = rotateTiltedY(
    relGx,
    relGy,
    relGz,
    galaxySpin,
    galTilt,
  )
  ;[relGx, relGy, relGz] = rotateY(relGx, relGy, relGz, galaxyOrbit)
  let px = hub[0] + relGx
  let py = hub[1] + relGy
  let pz = hub[2] + relGz
  ;[px, py, pz] = rotateY(px, py, pz, universeOrbit)
  return [px, py, pz]
}

/**
 * 从已 harmonize 的星点坐标求各语言星系质心（运动 hub）
 */
export function buildHarmonizedLanguageHubs(
  layout,
  virtualStars,
  positions,
  count,
) {
  /** @type {Map<string, { cx: number, cy: number, cz: number, n: number }>} */
  const acc = new Map()
  for (let i = 0; i < count; i += 1) {
    const lang = virtualLanguageKey(virtualStars[i], layout)
    if (!acc.has(lang)) acc.set(lang, { cx: 0, cy: 0, cz: 0, n: 0 })
    const m = acc.get(lang)
    m.cx += positions[i * 3]
    m.cy += positions[i * 3 + 1]
    m.cz += positions[i * 3 + 2]
    m.n += 1
  }
  /** @type {Map<string, [number, number, number]>} */
  const hubs = new Map()
  for (const [lang, m] of acc) {
    const inv = 1 / m.n
    hubs.set(lang, [m.cx * inv, m.cy * inv, m.cz * inv])
  }
  return hubs
}

/** 单语言星系的宇宙公转 + 自转参数（与星点星系层一致） */
export function buildLanguageHubMotion(layout, lang, hub) {
  const hLang = hashStr(`cosmic-motion:${lang}`)
  const langSign = motionSign(lang) * (hashUnit(hLang, 4) > 0.5 ? 1 : -1)
  const hubDist = Math.hypot(hub[0], hub[2])
  const span = 72
  const hubFactor = 18 / Math.max(hubDist, span * 0.12) ** 0.55
  const {
    SPEED_SCALE,
    HUB_ORBIT_BASE,
    HUB_ORBIT_SPREAD,
    GALAXY_SPIN_BASE,
    GALAXY_SPIN_SPREAD,
    GALAXY_ORBIT_BASE,
    GALAXY_ORBIT_SPREAD,
  } = GALAXY_MOTION
  const motionScale = SPEED_SCALE ?? 1

  const universeOrbit =
    langSign *
    HUB_ORBIT_BASE *
    hubFactor *
    (0.45 + hashUnit(hLang, 1) * HUB_ORBIT_SPREAD) *
    motionScale
  const galaxySpin =
    langSign *
    GALAXY_SPIN_BASE *
    (0.42 + hashUnit(hLang, 2) * GALAXY_SPIN_SPREAD) *
    (14 / Math.max(hubDist, 5.5)) *
    motionScale
  const galaxyOrbit =
    langSign *
    GALAXY_ORBIT_BASE *
    (0.4 + hashUnit(hLang, 5) * GALAXY_ORBIT_SPREAD) *
    motionScale
  const tiltMix = hashUnit(hLang, 6) * Math.PI * 2

  return { universeOrbit, galaxySpin, galaxyOrbit, tiltMix }
}
