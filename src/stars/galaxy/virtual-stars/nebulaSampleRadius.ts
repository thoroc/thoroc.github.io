import { MORPHOLOGY_LAYOUT } from '../constants'
import { hashUnitLocal } from './hashUnitLocal'

/** 星云晕径向：密核 + 幂律弥散外晕 */
export const nebulaSampleRadius = (h: number, cloudSpread: number): number => {
  const spread = Number.isFinite(cloudSpread) ? cloudSpread : 12
  const u = hashUnitLocal(h, 10)
  const coreRatio = MORPHOLOGY_LAYOUT.NEBULA_CORE_RATIO ?? 0.22
  if (u < coreRatio) {
    return spread * 0.14 * Math.cbrt(hashUnitLocal(h, 11))
  }
  const t = hashUnitLocal(h, 12)
  const haloPower = MORPHOLOGY_LAYOUT.NEBULA_HALO_POWER ?? 1.45
  const haloScale = MORPHOLOGY_LAYOUT.NEBULA_HALO_SCALE ?? 0.76
  return spread * (0.24 + t ** haloPower * haloScale)
}
