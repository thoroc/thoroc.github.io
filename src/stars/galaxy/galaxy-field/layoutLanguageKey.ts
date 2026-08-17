import type { GalaxyLayoutLike, LayoutItemLike } from './types'

export const layoutLanguageKey = (
  item: LayoutItemLike,
  layout: GalaxyLayoutLike,
): string => {
  const lang = item.language || '其他'
  return layout.langKeys?.has(lang) ? lang : '其他'
}
