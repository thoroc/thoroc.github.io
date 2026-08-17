import type { Rgb } from './hexToRgb'

/** 暗尘柱：深褐为主，保留微量语言色相 */
export const nebulaDustRgb = (langRgb: Rgb, density = 0.5): Rgb => {
  const d = Math.max(0, Math.min(1, density))
  const deep: Rgb = [0.035, 0.028, 0.022]
  const dust: Rgb = [
    0.1 + langRgb[0] * 0.09,
    0.06 + langRgb[1] * 0.05,
    0.045 + langRgb[2] * 0.04,
  ]
  return [
    deep[0] * (1 - d) + dust[0] * d,
    deep[1] * (1 - d) + dust[1] * d,
    deep[2] * (1 - d) + dust[2] * d,
  ]
}
