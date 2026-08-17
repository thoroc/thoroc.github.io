import { COSMIC_UNIVERSE, R_MAX, R_MIN } from '../constants'
import { hashStr, hashUnit } from '../hash'
import { galaxyFrameAngles } from './galaxyFrameAngles'
import { galaxyRadiusForLanguage } from './galaxyRadiusForLanguage'
import type {
  CosmicLanguageField,
  GalaxyKernel,
  GalaxyLayoutLike,
} from './types'

/** 单一宇宙密度场：每个语言一个重叠高斯吸引子 */
export const buildCosmicLanguageField = (
  layout: GalaxyLayoutLike,
  totalRepos = 1,
): CosmicLanguageField => {
  const langs = layout.languages || []
  const span = R_MAX - R_MIN
  const { ATTRACTOR_CORE_FRAC, HUB_RADIUS_FRAC } = COSMIC_UNIVERSE
  const coreR = span * (ATTRACTOR_CORE_FRAC ?? HUB_RADIUS_FRAC ?? 0.36)
  const kernels = new Map<string, GalaxyKernel>()

  for (const lang of langs) {
    const h = hashStr(`field-attractor:${lang}`)
    const u = hashUnit(h, 1)
    const v = hashUnit(h, 2)
    const w = hashUnit(h, 3)
    const theta = Math.PI * 2 * u
    const phi = Math.acos(Math.max(-1, Math.min(1, 2 * v - 1)))
    const radial = coreR * Math.cbrt(w) * (0.35 + hashUnit(h, 4) * 0.65)
    const cx = radial * Math.sin(phi) * Math.cos(theta)
    const cy = radial * Math.cos(phi)
    const cz = radial * Math.sin(phi) * Math.sin(theta)
    kernels.set(lang, {
      cx,
      cy,
      cz,
      sigma: galaxyRadiusForLanguage(lang, layout, totalRepos),
      frame: galaxyFrameAngles(lang),
      lang,
    })
  }

  return { kernels, span, coreR }
}
