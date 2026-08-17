import type { LayoutLike, VirtualStar } from './types'

export const virtualLanguageKey = (
  v: VirtualStar,
  layout: LayoutLike,
): string => {
  const lang = v.language || '其他'
  return layout?.langKeys?.has(lang) ? lang : '其他'
}
