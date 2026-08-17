import { boostSaturation } from './boostSaturation'
import type { Rgb } from './hexToRgb'

/** 语言色为主、恒星色温作少量物理 accent */
export const blendCosmicColor = (
  langRgb: Rgb,
  stellarRgb: Rgb,
  langMix = 0.2,
): Rgb => {
  const m = Math.max(0, Math.min(0.88, langMix))
  const lang = boostSaturation(langRgb)
  return [
    lang[0] * m + stellarRgb[0] * (1 - m),
    lang[1] * m + stellarRgb[1] * (1 - m),
    lang[2] * m + stellarRgb[2] * (1 - m),
  ]
}
