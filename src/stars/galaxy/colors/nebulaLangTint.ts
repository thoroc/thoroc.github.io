import { boostSaturation } from './boostSaturation'
import type { Rgb } from './hexToRgb'

/** 星云 tint：语言色作 accent，主色由 shader 内发射线色带驱动 */
export const nebulaLangTint = (langRgb: Rgb, density = 0.5): Rgb => {
  const lang = boostSaturation(langRgb, 1.38)
  const d = Math.max(0, Math.min(1, density))
  return [
    Math.min(1, lang[0] * (0.62 + d * 0.38)),
    Math.min(1, lang[1] * (0.62 + d * 0.38)),
    Math.min(1, lang[2] * (0.62 + d * 0.38)),
  ]
}
