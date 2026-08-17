import { COSMIC_UNIVERSE } from '../constants'
import { hashStr, hashUnit } from '../hash'
import type { FrameAngles } from './types'

/** 星系局部坐标系：近全向随机取向（三轴欧拉角） */
export const galaxyFrameAngles = (lang: string): FrameAngles => {
  const h = hashStr(`galaxy-frame:${lang}`)
  const spread = COSMIC_UNIVERSE.GALAXY_TILT_SPREAD
  return {
    tiltX: (hashUnit(h, 1) - 0.5) * spread * Math.PI,
    tiltY: hashUnit(h, 2) * Math.PI * 2,
    tiltZ: hashUnit(h, 3) * Math.PI * 2,
  }
}
