import { OTHER_LANGUAGE_KEY } from '../../utils/other-language'
import type { LayoutLike, VirtualStar } from './types'

export const virtualLanguageKey = (
  v: VirtualStar,
  layout: LayoutLike,
): string => {
  const lang = v.language || OTHER_LANGUAGE_KEY
  return layout?.langKeys?.has(lang) ? lang : OTHER_LANGUAGE_KEY
}
