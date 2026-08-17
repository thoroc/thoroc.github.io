/** 与图例语言桶一致的分组 key */
export const repoLegendLanguageKey = (
  item: { language?: string | null },
  legendLangs: Set<string> | string[],
): string => {
  const topSet = legendLangs instanceof Set ? legendLangs : new Set(legendLangs)
  const lang = item.language || '其他'
  return topSet.has(lang) ? lang : '其他'
}
