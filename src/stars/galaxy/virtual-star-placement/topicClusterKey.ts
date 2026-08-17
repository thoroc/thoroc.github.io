import { layoutLanguageKey } from '../galaxy-field'
import type { PlacementLayout, VirtualStarLike } from './types'

export const topicClusterKey = (
  v: VirtualStarLike,
  layout: PlacementLayout,
): string => {
  if (!v.topic) return ''
  const lang = layoutLanguageKey(v.item ?? v, layout)
  return `${lang}\0${v.topic}`
}
