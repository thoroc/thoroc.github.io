import { OTHER_LANGUAGE_KEY } from '../../utils/other-language'
import { stableCollator } from '../../utils/stable-collator'
import type { LegendEntry, RepoLike } from './types'

export const buildLanguageLegend = (
  items: RepoLike[] | null | undefined,
  topN = 10,
): LegendEntry[] => {
  const counts = new Map<string, number>()
  for (const item of items || []) {
    const key = item.language || OTHER_LANGUAGE_KEY
    counts.set(key, (counts.get(key) || 0) + 1)
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || stableCollator(a[0], b[0]))
    .slice(0, topN)
    .map(([name, count]) => ({ name, count }))
}
