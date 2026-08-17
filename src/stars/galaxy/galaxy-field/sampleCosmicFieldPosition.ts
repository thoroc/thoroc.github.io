import { COSMIC_UNIVERSE } from '../constants'
import { hashSeed, hashUnit } from '../hash'
import { applyFieldFilament } from './applyFieldFilament'
import { layoutLanguageKey } from './layoutLanguageKey'
import { pickSecondaryKernel } from './pickSecondaryKernel'
import { sampleLanguageKernel } from './sampleLanguageKernel'
import type {
  CosmicLanguageField,
  GalaxyLayoutLike,
  LayoutItemLike,
} from './types'

/** 密度场采样：主语言核 + 次核混合 + 丝状扰动 */
export const sampleCosmicFieldPosition = (
  item: LayoutItemLike,
  h: number,
  field: CosmicLanguageField,
  layout: GalaxyLayoutLike,
): [number, number, number] => {
  const lang = layoutLanguageKey(item, layout)
  const kernel = field.kernels.get(lang) ?? [...field.kernels.values()][0]
  if (!kernel) return [0, 0, 0]

  let pos = sampleLanguageKernel(h, kernel)

  const secondary = pickSecondaryKernel(h, lang, field.kernels)
  if (secondary) {
    const secPos = sampleLanguageKernel(hashSeed(h, 'blend'), secondary)
    const bleed = COSMIC_UNIVERSE.KERNEL_OVERLAP_BLEED ?? 0.14
    const mix = bleed * (0.45 + hashUnit(h, 17) * 0.55)
    pos = [
      pos[0] * (1 - mix) + secPos[0] * mix,
      pos[1] * (1 - mix) + secPos[1] * mix,
      pos[2] * (1 - mix) + secPos[2] * mix,
    ]
  }

  return applyFieldFilament(h, pos[0], pos[1], pos[2], field.span)
}
