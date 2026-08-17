import { COSMIC_UNIVERSE } from '../constants'
import type { GalaxyLayoutLike } from './types'

/** 具备气体云的语言星系：按仓数排名取前 N%（至少 1 个） */
export const qualifyingGasLanguages = (layout: GalaxyLayoutLike): string[] => {
  const { GAS_LANG_TOP_PERCENT } = COSMIC_UNIVERSE
  const langs = layout.languages || []
  if (!langs.length) return []

  const ranked = langs
    .map((lang) => ({ lang, count: layout.langCounts?.get(lang) ?? 0 }))
    .sort((a, b) => b.count - a.count || a.lang.localeCompare(b.lang))

  const topN = Math.max(1, Math.ceil(langs.length * GAS_LANG_TOP_PERCENT))
  return ranked.slice(0, topN).map((row) => row.lang)
}
