import { OTHER_LANGUAGE_KEY } from '../../utils/other-language'
import type { GalaxyLayoutLike, LayoutItemLike } from './types'

export const layoutLanguageKey = (
  item: LayoutItemLike,
  layout: GalaxyLayoutLike,
): string => {
  const lang = item.language || OTHER_LANGUAGE_KEY
  return layout.langKeys?.has(lang) ? lang : OTHER_LANGUAGE_KEY
}
