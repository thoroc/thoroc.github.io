import { GALAXY } from '../constants'
import { gauss3, hashUnit } from '../hash'

export interface DiskHeightParams {
  rr: number
  ang: number
  t: number
  ySeed: [number, number, number]
  starNorm: number
  act: number
}

/** 盘厚 + 银心隆起 + 轻微盘面翘曲 */
export const diskHeight = (
  h: number,
  { rr, ang, t, ySeed, starNorm, act }: DiskHeightParams,
): number => {
  const [ya, yb, yc] = ySeed
  const bulge =
    Math.exp(-((rr / 20) ** 2)) * GALAXY.BULGE * (1.15 + (1 - t) * 0.45)
  const diskY = gauss3(ya, yb, yc) * GALAXY.THICKNESS * (0.35 + t * 0.95)
  const warp = Math.sin(ang * 2 + hashUnit(h, 14) * Math.PI) * t * 2.4
  const lift = starNorm * GALAXY.THICKNESS * 0.28 * (1 - act * 0.35)
  return diskY + bulge * gauss3(ya, yb, yc) * 0.62 + warp + lift
}
