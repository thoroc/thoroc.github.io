import { topicRingKey, virtualLanguageKey } from '../virtual-stars'
import type { LayoutLike, VirtualStar } from './types'

export const boostTopicRingStars = (
  virtualStars: VirtualStar[],
  layout: LayoutLike,
  ringKeys: Set<string>,
  sizes: Float32Array,
  brights: Float32Array,
  count: number,
  ringStarFlags: Float32Array | null = null,
): void => {
  if (!ringKeys?.size || !count) return
  for (let i = 0; i < count; i += 1) {
    const v = virtualStars[i] as VirtualStar
    if (!v.topic) continue
    const lang = virtualLanguageKey(v, layout)
    if (!ringKeys.has(topicRingKey(lang, v.topic))) continue
    if (ringStarFlags && (ringStarFlags[i] as number) < 0.5) continue
    sizes[i] = (sizes[i] as number) * 1.06
    brights[i] = Math.min(1, (brights[i] as number) * 1.1)
  }
}
