import { repoLangRgb } from '../colors'
import { hashStr } from '../hash'
import { repoVisualInfluence, virtualStarRgb } from '../repo-position'
import { repoBrightness } from '../star-visuals'
import type { MaxCtx, StarVisualBuffers, VirtualStar } from './types'

/** 逐虚拟星填色/亮度/活跃度/随机种子；锚点仓库额外加成 */
export const buildStarVisualBuffers = (
  virtualStars: VirtualStar[],
  sizeCtx: MaxCtx,
  sizes: Float32Array,
  anchorIndex: number,
  repoActivityById: Map<string, number>,
): StarVisualBuffers => {
  const count = virtualStars.length
  const colors = new Float32Array(count * 3)
  const brights = new Float32Array(count)
  const activities = new Float32Array(count)
  const seeds = new Float32Array(count)
  const idToIndex = new Map<string, number>()

  for (let i = 0; i < count; i += 1) {
    const v = virtualStars[i] as VirtualStar
    const item = v.item

    const influence = repoVisualInfluence(item, sizeCtx)
    const [r, g, b] = virtualStarRgb(v, repoLangRgb(item.language), influence)
    const bright = repoBrightness(item, sizeCtx)
    colors[i * 3] = r * (0.78 + bright * 0.42)
    colors[i * 3 + 1] = g * (0.78 + bright * 0.42)
    colors[i * 3 + 2] = b * (0.78 + bright * 0.42)

    brights[i] = bright
    if (i === anchorIndex) {
      sizes[i] = (sizes[i] as number) * 1.4
      brights[i] = Math.min(1, (brights[i] as number) * 1.12)
      colors[i * 3] = (colors[i * 3] as number) * 1.08
      colors[i * 3 + 1] = (colors[i * 3 + 1] as number) * 1.08
      colors[i * 3 + 2] = (colors[i * 3 + 2] as number) * 1.08
    }
    activities[i] = repoActivityById.get(v.repoId) ?? 0
    seeds[i] = (hashStr(v.virtualKey) % 1000) / 1000
    if (!idToIndex.has(v.repoId)) {
      idToIndex.set(v.repoId, i)
    }
  }

  return { colors, brights, activities, seeds, idToIndex }
}
