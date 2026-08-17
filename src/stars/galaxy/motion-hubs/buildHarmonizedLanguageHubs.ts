import { virtualLanguageKey } from '../virtual-stars'
import type { LayoutLike, Vec3, VirtualStarLike } from './types'

interface Centroid {
  cx: number
  cy: number
  cz: number
  n: number
}

/** 从已 harmonize 的星点坐标求各语言星系质心（运动 hub） */
export const buildHarmonizedLanguageHubs = (
  layout: LayoutLike,
  virtualStars: VirtualStarLike[],
  positions: Float32Array,
  count: number,
): Map<string, Vec3> => {
  const acc = new Map<string, Centroid>()
  for (let i = 0; i < count; i += 1) {
    const lang = virtualLanguageKey(virtualStars[i] as VirtualStarLike, layout)
    if (!acc.has(lang)) acc.set(lang, { cx: 0, cy: 0, cz: 0, n: 0 })
    const m = acc.get(lang) as Centroid
    m.cx += positions[i * 3] as number
    m.cy += positions[i * 3 + 1] as number
    m.cz += positions[i * 3 + 2] as number
    m.n += 1
  }
  const hubs = new Map<string, Vec3>()
  for (const [lang, m] of acc) {
    const inv = 1 / m.n
    hubs.set(lang, [m.cx * inv, m.cy * inv, m.cz * inv])
  }
  return hubs
}
