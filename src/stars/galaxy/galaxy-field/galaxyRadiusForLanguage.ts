import { COSMIC_UNIVERSE, R_MAX, R_MIN } from '../constants'
import type { GalaxyLayoutLike } from './types'

/** 语言高斯核 σ（仓数越多略大，但上限受控避免独占） */
export const galaxyRadiusForLanguage = (
  lang: string,
  layout: GalaxyLayoutLike,
  totalRepos: number,
): number => {
  const span = R_MAX - R_MIN
  const count = layout.langCounts?.get(lang) ?? 1
  const share = count / Math.max(totalRepos, 1)
  const {
    KERNEL_SIGMA_FRAC,
    KERNEL_SIGMA_POWER,
    GALAXY_BASE_FRAC,
    GALAXY_SIZE_POWER,
  } = COSMIC_UNIVERSE
  const sigmaFrac = KERNEL_SIGMA_FRAC ?? GALAXY_BASE_FRAC
  const sigmaPow = KERNEL_SIGMA_POWER ?? GALAXY_SIZE_POWER
  return span * sigmaFrac * (0.68 + share ** sigmaPow * 0.48)
}
