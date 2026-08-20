import { OTHER_LANGUAGE_KEY } from '../../utils/other-language'

/** 与图例语言桶一致的分组 key */
export const repoLegendLanguageKey = (
  item: { language?: string | null },
  legendLangs: Set<string> | string[],
): string => {
  const topSet = legendLangs instanceof Set ? legendLangs : new Set(legendLangs)
  const lang = item.language || OTHER_LANGUAGE_KEY
  return topSet.has(lang) ? lang : OTHER_LANGUAGE_KEY
}
