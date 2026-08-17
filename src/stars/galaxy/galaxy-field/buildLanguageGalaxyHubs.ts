import { buildCosmicLanguageField } from './buildCosmicLanguageField'
import type { GalaxyLayoutLike } from './types'

/** 语言星系 hub：兼容 motion/gas，返回密度场吸引子中心 */
export const buildLanguageGalaxyHubs = (
  layout: GalaxyLayoutLike,
): Map<string, [number, number, number]> => {
  const field = buildCosmicLanguageField(layout, 1)
  const hubs = new Map<string, [number, number, number]>()
  for (const [lang, kernel] of field.kernels) {
    hubs.set(lang, [kernel.cx, kernel.cy, kernel.cz])
  }
  return hubs
}
