import type { Rgb } from './hexToRgb'

/** 综合影响力 → 近似恒星色温（红 → 黄 → 蓝白） */
export const stellarTempRgb = (influence: number, hashJitter = 0): Rgb => {
  const t = Math.max(0, Math.min(1, influence * 0.92 + hashJitter))
  const warm = 1 - t
  const r = 0.55 + warm * 0.42 + t * 0.22
  const g = 0.38 + warm * 0.32 + t * 0.58
  const b = 0.28 + warm * 0.08 + t * 0.82
  const len = Math.hypot(r, g, b) || 1
  return [r / len, g / len, b / len]
}
