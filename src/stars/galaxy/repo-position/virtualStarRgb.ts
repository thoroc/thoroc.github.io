import { blendCosmicColor, stellarTempRgb } from '../colors'
import { hashStr } from '../hash'
import type { Rgb, VirtualStarLike } from './types'

export const virtualStarRgb = (
  v: VirtualStarLike,
  langRgb: Rgb,
  influence: number,
): Rgb => {
  const h = hashStr(v.virtualKey)
  const jitter = (((h >>> 8) & 0xffff) / 0xffff) * 0.18 - 0.09
  const stellar = stellarTempRgb(influence, jitter)
  const langMix = v.topic ? 0.58 : 0.68
  return blendCosmicColor(langRgb, stellar, langMix)
}
