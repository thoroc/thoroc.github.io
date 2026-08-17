import { GALAXY_MOTION } from '../constants'
import { hashStr, hashUnit } from '../hash'
import { motionSign } from '../motion-math'
import type { LanguageHubMotion, Vec3 } from './types'

/** 单语言星系的宇宙公转 + 自转参数（与星点星系层一致） */
export const buildLanguageHubMotion = (
  _layout: unknown,
  lang: string,
  hub: Vec3,
): LanguageHubMotion => {
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
