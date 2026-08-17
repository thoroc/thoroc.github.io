import type { LanguageLayout, RepoLike } from './types'

export const layoutLanguageKey = (
  item: Pick<RepoLike, 'language'>,
  layout: LanguageLayout,
): string => {
  const lang = item.language || '其他'
  return layout.langKeys.has(lang) ? lang : '其他'
}
