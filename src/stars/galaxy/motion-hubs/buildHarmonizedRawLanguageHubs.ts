import { buildLanguageGalaxyHubs } from '../galaxy-field'
import type { HarmonizeMeta, LayoutLike, Vec3 } from './types'

export const buildHarmonizedRawLanguageHubs = (
  layout: LayoutLike,
  harmonizeMeta: HarmonizeMeta | null,
): Map<string, Vec3> | null => {
  if (!harmonizeMeta) return null
  const rawHubs = buildLanguageGalaxyHubs(layout)
  const { cx, cy, cz, scale, yFlatten } = harmonizeMeta
  const hubs = new Map<string, Vec3>()
  for (const [lang, hub] of rawHubs) {
    hubs.set(lang, [
      (hub[0] - cx) * scale,
      (hub[1] - cy) * scale * yFlatten,
      (hub[2] - cz) * scale,
    ])
  }
  return hubs
}
