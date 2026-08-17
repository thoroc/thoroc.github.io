import { COSMIC_UNIVERSE } from '../constants'
import { galaxyFrameAngles } from '../galaxy-field'
import { hashStr, hashUnit } from '../hash'
import type { GasClump, GasClumpField } from './types'

/** 多 clump 气体场：椭球团 + 丝状链，模拟真实星云结构 */
export const buildGasClumpField = (
  lang: string,
  galaxyR: number,
): GasClumpField => {
  const h = hashStr(`gas-mono:${lang}`)
  const gR = galaxyR
  const { GAS_DISK_RADIUS_MULT, GAS_DISK_RADIUS_JITTER } = COSMIC_UNIVERSE
  const diskR = GAS_DISK_RADIUS_MULT + hashUnit(h, 1) * GAS_DISK_RADIUS_JITTER
  const frame = galaxyFrameAngles(lang)
  const clumpCount = 3 + Math.floor(hashUnit(h, 2) * 4)

  const clumps: GasClump[] = []
  let weightSum = 0

  for (let ci = 0; ci < clumpCount; ci += 1) {
    const ch = hashStr(`gas-clump:${lang}:${ci}`)
    const ang = hashUnit(ch, 0) * Math.PI * 2
    const dist = gR * (0.08 + hashUnit(ch, 1) * 0.68)
    const scale = 0.34 + hashUnit(ch, 3) * 0.48
    const filAng = hashUnit(ch, 9) * Math.PI * 2
    const weight = 0.45 + hashUnit(ch, 8) * 1.15
    const pillar = hashUnit(ch, 11) < 0.38
    const rxBase = gR * diskR * scale * (0.88 + hashUnit(ch, 4) * 0.42)
    const ryBase = gR * diskR * scale * (0.68 + hashUnit(ch, 5) * 0.38)
    const rzBase = gR * diskR * scale * (0.82 + hashUnit(ch, 6) * 0.4)
    clumps.push({
      cx: Math.cos(ang) * dist,
      cy: (hashUnit(ch, 2) - 0.5) * gR * (pillar ? 0.28 : 0.22),
      cz: Math.sin(ang) * dist,
      rx: pillar ? rxBase * 0.32 : rxBase,
      ry: pillar ? ryBase * (2.1 + hashUnit(ch, 12) * 0.9) : ryBase,
      rz: pillar ? rzBase * 0.34 : rzBase,
      tiltX: frame.tiltX,
      tiltY: frame.tiltY,
      tiltZ: frame.tiltZ + (hashUnit(ch, 7) - 0.5) * 0.45,
      weight,
      filDx: pillar ? 0 : Math.cos(filAng),
      filDy: pillar ? 1 : (hashUnit(ch, 10) - 0.5) * 0.32,
      filDz: pillar ? 0 : Math.sin(filAng),
      pillar,
    })
    weightSum += weight
  }

  if (!clumps.length) {
    clumps.push({
      cx: 0,
      cy: 0,
      cz: 0,
      rx: gR * diskR * 0.72,
      ry: gR * diskR * 0.58,
      rz: gR * diskR * 0.68,
      tiltX: frame.tiltX,
      tiltY: frame.tiltY,
      tiltZ: frame.tiltZ,
      weight: 1,
      filDx: 1,
      filDy: 0,
      filDz: 0,
      pillar: false,
    })
    weightSum = 1
  }

  return { clumps, weightSum, morphology: 2 }
}
