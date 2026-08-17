import { virtualLanguageKey } from '../virtual-stars'
import type { LayoutLike, VirtualStarLike } from './types'

export const virtualTopicKey = (
  v: VirtualStarLike,
  layout: LayoutLike,
): string => {
  const lang = virtualLanguageKey(v, layout)
  const topic = v.topic || '__none__'
  return `${lang}\0${topic}`
}
