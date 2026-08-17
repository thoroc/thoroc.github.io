import type { Rgb } from './hexToRgb'

/** Shared by blendCosmicColor and nebulaLangTint. */
export const boostSaturation = (rgb: Rgb, amount = 1.42): Rgb => {
  const lum = (rgb[0] + rgb[1] + rgb[2]) / 3
  return [
    Math.min(1, lum + (rgb[0] - lum) * amount),
    Math.min(1, lum + (rgb[1] - lum) * amount),
    Math.min(1, lum + (rgb[2] - lum) * amount),
  ]
}
