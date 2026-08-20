import { OTHER_LANGUAGE_KEY } from '../../utils/other-language'
import type { LanguageLayout, RepoLike } from './types'

export const layoutLanguageKey = (
  item: Pick<RepoLike, 'language'>,
  layout: LanguageLayout,
): string => {
  const lang = item.language || OTHER_LANGUAGE_KEY
  return layout.langKeys.has(lang) ? lang : OTHER_LANGUAGE_KEY
}
